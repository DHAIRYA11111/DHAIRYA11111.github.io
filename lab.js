(() => {
  const lab = document.querySelector('#lab');
  if (!lab) return;
  const tablist = lab.querySelector('[role="tablist"]');
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  if (panels.some(panel => !panel)) return;

  function activate(index) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.tabIndex = active ? 0 : -1;
      tab.setAttribute('aria-selected', String(active));
      panels[i].open = active;
      panels[i].hidden = !active;
    });
  }

  tabs.forEach((tab, i) => {
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
    tab.addEventListener('click', () => activate(i));
    tab.addEventListener('keydown', event => {
      const keys = {ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1};
      if (!(event.key in keys)) return;
      event.preventDefault();
      const next = (keys[event.key] + tabs.length) % tabs.length;
      activate(next);
      tabs[next].focus();
    });
  });

  activate(0);
  lab.classList.add('lab-ready');
  tablist.hidden = false;
})();
