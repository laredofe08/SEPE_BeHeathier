/*==== nav-bar ====*/
const menuToggle = document.getElementById('menuToggle');
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('#navLinks a');

function toggleMenu(forceState) {
    const isOpen = navbar.classList.toggle('open', forceState);
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
}

menuToggle.addEventListener('click', () => toggleMenu());

// Fecha o menu ao clicar em um link
navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
});

// Fecha o menu ao clicar fora dele
document.addEventListener('click', (e) => {
    const clickedOutside = !navbar.contains(e.target) && !menuToggle.contains(e.target);
    if (navbar.classList.contains('open') && clickedOutside) {
        toggleMenu(false);
    }
});

/*==== login ====*/

// Flip do card de login/cadastro
const loginCard = document.getElementById('loginCard');
const toCadastro = document.getElementById('toCadastro');
const toLogin = document.getElementById('toLogin');

if (loginCard) {
    toCadastro.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.add('flipped');
    });

    toLogin.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.remove('flipped');
    });
}