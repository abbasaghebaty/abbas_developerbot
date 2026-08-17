// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // Close menu when clicking a link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
}

// FAQ Accordion
const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach(item => {
  const header = item.querySelector('.accordion-header');
  if (header) {
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close all
      accordionItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  }
});

// Commission Calculator
const salesRange = document.getElementById('salesRange');
const salesCount = document.getElementById('salesCount');
const commissionResult = document.getElementById('commissionResult');

if (salesRange && salesCount && commissionResult) {
  const COMMISSION_PER_SALE = 80000;
  const formatNumber = (num) => {
    return num.toLocaleString('fa-IR');
  };

  const updateCalculator = () => {
    const sales = parseInt(salesRange.value, 10);
    const commission = sales * COMMISSION_PER_SALE;
    salesCount.textContent = formatNumber(sales);
    commissionResult.textContent = formatNumber(commission) + ' تومان';
  };

  salesRange.addEventListener('input', updateCalculator);
  updateCalculator();
}
