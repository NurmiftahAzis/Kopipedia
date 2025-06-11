// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
  // Handle Register Form Submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const fullname = document.getElementById('fullname').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (password !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Registrasi Gagal',
          text: 'Konfirmasi password tidak cocok!'
        });
        return;
      }

      fetch('php/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `fullname=${fullname}&email=${email}&phone=${phone}&password=${password}`
      })
      .then(response => response.text())
      .then(data => {
        if (data === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Registrasi Berhasil',
            text: 'Akun Anda berhasil dibuat! Silakan login.'
          }).then(() => {
            window.location.href = 'login.html';
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Registrasi Gagal',
            text: 'Terjadi kesalahan saat mendaftar. Email mungkin sudah terdaftar.'
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Terjadi kesalahan jaringan.'
        });
      });
    });
  }

  // Handle Login Form Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      fetch('php/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${email}&password=${password}`
      })
      .then(response => response.text())
      .then(data => {
        if (data === 'success') {
          // Store user session information in localStorage (for client-side access)
          // This is a simplified approach. For production, consider JWT or more robust session management.
          // Fetch user details after successful login if needed
          fetch('php/get_user_info.php') // You'll need to create this endpoint
            .then(res => res.json())
            .then(userInfo => {
              localStorage.setItem('currentUser', JSON.stringify(userInfo));
              Swal.fire({
                icon: 'success',
                title: 'Login Berhasil',
                text: 'Selamat datang di KopiPedia!'
              }).then(() => {
                window.location.href = 'index.html';
              });
            });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Login Gagal',
            text: 'Email atau password salah.'
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Terjadi kesalahan jaringan.'
        });
      });
    });
  }

  // Manage Auth Buttons in Navbar (Login/Register vs. Profile/Logout)
  const navbarAuth = document.getElementById('navbar-auth');
  function updateAuthButtons() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (navbarAuth) {
      navbarAuth.innerHTML = ''; // Clear existing buttons
      if (currentUser && currentUser.fullname) {
        // User is logged in
        const profileLink = document.createElement('a');
        profileLink.href = 'profile.html';
        profileLink.className = 'button';
        profileLink.style.marginRight = '1rem';
        profileLink.textContent = currentUser.fullname; // Display user's name
        navbarAuth.appendChild(profileLink);

        const logoutButton = document.createElement('a');
        logoutButton.href = '#';
        logoutButton.className = 'button';
        logoutButton.textContent = 'Keluar';
        logoutButton.addEventListener('click', (e) => {
          e.preventDefault();
          Swal.fire({
            icon: 'question',
            title: 'Konfirmasi Keluar',
            text: 'Anda yakin ingin keluar?',
            showCancelButton: true,
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal'
          }).then((result) => {
            if (result.isConfirmed) {
              fetch('php/logout.php') // You'll need to create this endpoint
                .then(response => response.text())
                .then(() => {
                  localStorage.removeItem('currentUser'); // Clear local storage
                  window.location.href = 'index.html'; // Redirect to home
                })
                .catch(error => console.error('Logout error:', error));
            }
          });
        });
        navbarAuth.appendChild(logoutButton);

      } else {
        // User is not logged in
        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.className = 'button';
        loginLink.style.marginRight = '1rem';
        loginLink.textContent = 'Masuk';
        navbarAuth.appendChild(loginLink);

        const registerLink = document.createElement('a');
        registerLink.href = 'register.html';
        registerLink.className = 'button';
        registerLink.style.marginRight = '1rem';
        registerLink.textContent = 'Daftar';
        navbarAuth.appendChild(registerLink);
      }
      // Add hamburger icon back
      const hamburgerIcon = document.createElement('i');
      hamburgerIcon.setAttribute('data-feather', 'menu');
      hamburgerIcon.className = 'icon';
      hamburgerIcon.id = 'hamburger';
      navbarAuth.appendChild(hamburgerIcon);
      feather.replace(); // Re-render feather icons
    }
  }

  updateAuthButtons(); // Call on page load

  // Hamburger menu (assuming it's handled in script.js, but also needs to work here)
  const navbarListGroup = document.querySelector('.navbar-list-group');
  const hamburgerButton = document.getElementById('hamburger');
  if (hamburgerButton) {
    hamburgerButton.addEventListener('click', () => {
      navbarListGroup.classList.toggle('active');
    });
  }
  document.addEventListener('click', event => {
    if (hamburgerButton && !hamburgerButton.contains(event.target) && navbarListGroup && !navbarListGroup.contains(event.target)) {
      navbarListGroup.classList.remove('active');
    }
  });

});