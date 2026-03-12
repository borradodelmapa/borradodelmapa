// === Script block 1 ===
(function(){
  const nav = document.querySelector('nav');
  if(!nav) return;
  const onScroll = () => {
    if(window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
})();

// === Script block 2 ===
(function(){
  const WINDOW_MS = 60 * 1000;
  const MAX_REQUESTS = 10;

  function getChatTimestamps() {
    try {
      const raw = localStorage.getItem('salmaRateLimitTimestamps');
      const list = raw ? JSON.parse(raw) : [];
      const now = Date.now();
      return list.filter(ts => now - ts < WINDOW_MS);
    } catch (e) {
      return [];
    }
  }

  function saveChatTimestamps(list) {
    try {
      localStorage.setItem('salmaRateLimitTimestamps', JSON.stringify(list));
    } catch (e) {}
  }

  function getSecondsRemaining(list) {
    if (!list.length) return 0;
    const oldest = list[0];
    const remaining = Math.ceil((WINDOW_MS - (Date.now() - oldest)) / 1000);
    return remaining > 0 ? remaining : 0;
  }

  function updateRateLimitUI() {
    const list = getChatTimestamps();
    saveChatTimestamps(list);
    const msg = document.getElementById('salma-rate-limit-msg');
    const sendBtn = document.getElementById('salma-send');
    const remaining = getSecondsRemaining(list);

    if (!msg || !sendBtn) return;

    if (list.length >= MAX_REQUESTS && remaining > 0) {
      msg.style.display = 'block';
      msg.textContent = 'Has alcanzado el límite de 10 preguntas por minuto. Inténtalo de nuevo en ' + remaining + ' segundos.';
      sendBtn.disabled = true;
    } else {
      msg.style.display = 'none';
      sendBtn.disabled = false;
    }
  }

  window.salmaRateLimitCanSend = function() {
    const list = getChatTimestamps();
    const remaining = getSecondsRemaining(list);
    if (list.length >= MAX_REQUESTS && remaining > 0) {
      updateRateLimitUI();
      return false;
    }
    list.push(Date.now());
    saveChatTimestamps(list);
    updateRateLimitUI();
    return true;
  };

  document.addEventListener('DOMContentLoaded', function() {
    updateRateLimitUI();
    setInterval(updateRateLimitUI, 1000);
  });
})();

