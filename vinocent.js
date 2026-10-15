var tabData = {
    mission: '<p class="text-slate-300 text-sm leading-relaxed">Our mission is to empower global commercial ventures by delivering robust supply chain logistics, cutting-edge technical expertise, and ethically managed resource commodities.</p>',
    vision: '<p class="text-slate-300 text-sm leading-relaxed">To be the foremost trusted partner for intercontinental industrial trade, pioneering sustainable resource distribution and driving technical transformation.</p>',
    values: '<ul class="space-y-2 text-sm text-slate-300"><li>Uncompromising Integrity &amp; Regulatory Rigor</li><li>Continuous Technological Innovation</li></ul>'
};

function switchTab(tabKey) {
    var buttons = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('border-gold-500', 'text-gold-400');
        buttons[i].classList.add('border-transparent', 'text-slate-400');
    }
    var activeBtn = document.getElementById('tab-' + tabKey);
    if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-slate-400');
        activeBtn.classList.add('border-gold-500', 'text-gold-400');
    }
    document.getElementById('tab-content').innerHTML = tabData[tabKey];
}

function toggleModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

function toggleMobileMenu() {
    var menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

var serviceDetails = {
    'supply-chain': {
        title: 'Supply Chain &amp; Freight Management',
        desc: 'Vinocent provides comprehensive air, ocean, and terrestrial freight management with optimized cargo transit times.'
    },
    'tech-consulting': {
        title: 'Technical &amp; Industrial Consulting',
        desc: 'Our senior engineers advise enterprise clients on plant modernizations, automated process integration, and compliance audits.'
    },
    'energy': {
        title: 'Renewable Energy Infrastructure',
        desc: 'Turnkey clean energy infrastructure development including industrial solar farms and off-grid battery energy storage.'
    }
};

function openServiceModal(key) {
    var data = serviceDetails[key];
    if (data) {
        document.getElementById('serviceModalTitle').innerHTML = data.title;
        document.getElementById('serviceModalBody').innerHTML = '<p>' + data.desc + '</p>';
        toggleModal('serviceDetailModal');
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    document.getElementById('contactForm').classList.add('hidden');
    document.getElementById('formSuccess').classList.remove('hidden');
  }
