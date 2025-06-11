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
        body: `fullname=<span class="math-inline">\{fullname\}&email\=</span>{email}&phone=<span class="math-inline">\{phone\}&password\=</span>{password}`
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
        } else if (data === 'error_duplicate_email') {
          Swal.fire({
            icon: 'error',
            title: 'Registrasi Gagal',
            text: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Registrasi Gagal',
            text: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
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
        body: `email=<span class="math-inline">\{email\}&password\=</span>{password}`
      })
      .then(response => response.text())
      .then(data => {
        if (data === 'success') {
          // Fetch user details after successful login and store in localStorage
          fetch('php/get_user_info.php')
            .then(res => res.json())
            .then(userInfo => {
              if (userInfo.status === 'success') {
                localStorage.setItem('currentUser', JSON.stringify(userInfo.user)); // Store only the user object
                Swal.fire({
                  icon: 'success',
                  title: 'Login Berhasil',
                  text: 'Selamat datang di KopiPedia!'
                }).then(() => {
                  window.location.href = 'index.html';
                });
              } else {
                  Swal.fire({ // If get_user_info fails but login succeeded
                      icon: 'warning',
                      title: 'Login Berhasil (Info Profil Bermasalah)',
                      text: 'Terjadi masalah saat mengambil info profil. Anda mungkin perlu memuat ulang halaman.'
                  }).then(() => {
                      window.location.href = 'index.html';
                  });
              }
            })
            .catch(error => {
                console.error('Error fetching user info after login:', error);
                Swal.fire({
                    icon: 'warning',
                    title: 'Login Berhasil (Masalah Koneksi)',
                    text: 'Terjadi masalah jaringan saat mengambil info profil.'
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
              fetch('php/logout.php')
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
  // This part might be duplicated if script.js also has it.
  // Consider centralizing hamburger logic if possible, or ensure it's idempotent.
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