(function(){
  'use strict';
  var endpoint='https://jpiu-chat-api.jeremiahpaulumahag.workers.dev';
  var history=[];

  function initChat() {
    var launcher = document.querySelector('.ai-chat-launcher');
    var win = document.querySelector('.ai-chat-window');

    if (!launcher || !win) {
      console.error('Chatbot widget elements not found in DOM.');
      return;
    }

    var messages = win.querySelector('.ai-chat-messages');
    var form = win.querySelector('.ai-chat-form');
    var input = win.querySelector('.ai-chat-input');
    var send = win.querySelector('.ai-chat-send');
    var closeBtn = win.querySelector('.ai-chat-close');

    if (!messages || !form || !input || !send || !closeBtn) {
      console.error('Chatbot inner elements not found.');
      return;
    }

    function addMessage(text, role, isHtml) {
      var el = document.createElement('div');
      el.className = 'ai-chat-message ' + role;
      if (isHtml) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    }

    function openChat() {
      win.classList.add('is-open');
      launcher.setAttribute('aria-expanded', 'true');
      if (!messages.children.length) {
        addMessage("Hi! I'm Jeremiah's AI assistant. Ask me about real estate media, social media management, or post-production.", 'assistant');
      }
      setTimeout(function() { input.focus(); }, 100);
    }

    function closeChat() {
      win.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    }

    launcher.addEventListener('click', function() {
      win.classList.contains('is-open') ? closeChat() : openChat();
    });

    closeBtn.addEventListener('click', closeChat);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && win.classList.contains('is-open')) {
        closeChat();
      }
    });

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || send.disabled) return;

      addMessage(text, 'user');
      history.push({ role: 'user', content: text });
      input.value = '';
      send.disabled = true;

      var typing = addMessage('', 'assistant typing');
      typing.innerHTML = '<span></span><span></span><span></span>';

      var lowerText = text.toLowerCase();
      if (lowerText.includes('cv') || lowerText.includes('resume') || lowerText.includes('pdf') || lowerText.includes('download') || lowerText.includes('jeremiah\'s cv')) {
        typing.remove();
        var cvReply = 'You can download Jeremiah\'s CV directly here: <a href="CVs/Jeremiah Paul Umahag - Master CV 2026 Q4.pdf" download style="color:var(--gold);text-decoration:underline;">Download CV (PDF)</a>';
        addMessage(cvReply, 'assistant', true);
        history.push({ role: 'assistant', content: cvReply });
        send.disabled = false;
        input.focus();
        return;
      }

      try {
        var response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });
        if (!response.ok) throw new Error('Request failed');
        var data = await response.json();
        var reply = data.reply || data.response || data.message || 
          (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content);
        if (!reply) throw new Error('Empty response');
        typing.remove();
        addMessage(reply, 'assistant');
        history.push({ role: 'assistant', content: reply });
      } catch (err) {
        typing.remove();
        addMessage("I'm having trouble connecting right now. Please try again or use the contact link on this page.", 'assistant');
      } finally {
        send.disabled = false;
        input.focus();
      }
    });

    console.log('Chatbot initialized successfully.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }
})();