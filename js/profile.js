// js/profile.js

document.addEventListener('DOMContentLoaded', () => {
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profilePhone = document.getElementById('profile-phone');
  const profileDate = document.getElementById('profile-date');
  const addressList = document.getElementById('address-list');
  const addAddressBtn = document.getElementById('add-address-btn');
  const addressModal = document.querySelector('.modal[data-id="addressModal"]');
  const addressForm = document.getElementById('address-form');
  const addressIdInput = document.getElementById('address-id');

  // Function to fetch and display user profile
  function fetchUserProfile() {
    fetch('php/get_user_info.php') // Create this PHP file
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const user = data.user;
          profileName.textContent = user.fullname;
          profileEmail.textContent = user.email;
          profilePhone.textContent = user.phone;
          profileDate.textContent = new Date(user.created_at).toLocaleDateString('id-ID'); // Format date

          // Store user info in localStorage for auth.js
          localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
          // Redirect to login if not logged in or session expired
          Swal.fire({
            icon: 'error',
            title: 'Akses Ditolak',
            text: 'Silakan login untuk melihat profil Anda.'
          }).then(() => {
            window.location.href = 'login.html';
          });
        }
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Tidak dapat memuat data profil.'
        }).then(() => {
          window.location.href = 'login.html';
        });
      });
  }

  // Function to fetch and display user addresses
  function fetchUserAddresses() {
    fetch('php/get_addresses.php') // Create this PHP file
      .then(response => response.json())
      .then(data => {
        addressList.innerHTML = ''; // Clear previous addresses
        if (data.status === 'success' && data.addresses.length > 0) {
          data.addresses.forEach(address => {
            const addressCard = document.createElement('div');
            addressCard.className = 'address-card';
            addressCard.innerHTML = `
              <div class="address-header">
                <h4>${address.label}</h4>
                <div class="address-actions">
                  <button type="button" class="edit-address-btn" data-id="${address.id}">
                    <i data-feather="edit"></i>
                  </button>
                  <button type="button" class="delete-address-btn" data-id="${address.id}">
                    <i data-feather="trash-2"></i>
                  </button>
                </div>
              </div>
              <div class="address-details">
                <p>${address.recipient_name} (${address.recipient_phone})</p>
                <p>${address.full_address}, ${address.postal_code}</p>
              </div>
            `;
            addressList.appendChild(addressCard);
          });
          feather.replace(); // Re-render feather icons after adding new elements
        } else {
          addressList.innerHTML = '<p class="empty-message">Belum ada alamat tersimpan</p>';
        }
      })
      .catch(error => {
        console.error('Error fetching addresses:', error);
        addressList.innerHTML = '<p class="empty-message">Gagal memuat alamat.</p>';
      });
  }

  // Event listener for "Tambah Alamat Baru" button
  addAddressBtn.addEventListener('click', () => {
    // Reset form for new address
    addressForm.reset();
    addressIdInput.value = ''; // Clear address ID for new entry
    addressModal.querySelector('h3').textContent = 'Tambah Alamat Baru';
    addressModal.classList.add('active');
  });

  // Event listener for address form submission (Add/Edit)
  addressForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const id = addressIdInput.value;
    const label = document.getElementById('address-label').value;
    const recipientName = document.getElementById('recipient-name').value;
    const recipientPhone = document.getElementById('recipient-phone').value;
    const fullAddress = document.getElementById('address-detail').value;
    const postalCode = document.getElementById('postal-code').value;

    const url = id ? 'php/update_address.php' : 'php/add_address.php'; // Create these PHP files
    const method = 'POST'; // Always POST for simplicity, PHP can handle update based on ID

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `id=${id}&label=${label}&recipient_name=${recipientName}&recipient_phone=${recipientPhone}&full_address=${fullAddress}&postal_code=${postalCode}`
    })
    .then(response => response.text())
    .then(data => {
      if (data === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: id ? 'Alamat berhasil diperbarui.' : 'Alamat baru berhasil ditambahkan.'
        });
        addressModal.classList.remove('active');
        fetchUserAddresses(); // Refresh addresses
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Terjadi kesalahan saat menyimpan alamat.'
        });
      }
    })
    .catch(error => {
      console.error('Error saving address:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan jaringan.'
      });
    });
  });

  // Event delegation for edit/delete buttons on addresses
  addressList.addEventListener('click', (e) => {
    if (e.target.closest('.edit-address-btn')) {
      const addressId = e.target.closest('.edit-address-btn').dataset.id;
      // Fetch address details to populate the form
      fetch(`php/get_address_detail.php?id=${addressId}`) // Create this PHP file
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success' && data.address) {
            const address = data.address;
            document.getElementById('address-label').value = address.label;
            document.getElementById('recipient-name').value = address.recipient_name;
            document.getElementById('recipient-phone').value = address.recipient_phone;
            document.getElementById('address-detail').value = address.full_address;
            document.getElementById('postal-code').value = address.postal_code;
            addressIdInput.value = address.id; // Set ID for update

            addressModal.querySelector('h3').textContent = 'Edit Alamat';
            addressModal.classList.add('active');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Alamat tidak ditemukan.'
            });
          }
        })
        .catch(error => {
          console.error('Error fetching address detail:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Tidak dapat memuat detail alamat.'
          });
        });
    } else if (e.target.closest('.delete-address-btn')) {
      const addressId = e.target.closest('.delete-address-btn').dataset.id;
      Swal.fire({
        icon: 'warning',
        title: 'Hapus Alamat?',
        text: 'Anda yakin ingin menghapus alamat ini?',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          fetch('php/delete_address.php', { // Create this PHP file
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${addressId}`
          })
          .then(response => response.text())
          .then(data => {
            if (data === 'success') {
              Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Alamat berhasil dihapus.'
              });
              fetchUserAddresses(); // Refresh addresses
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Terjadi kesalahan saat menghapus alamat.'
              });
            }
          })
          .catch(error => {
            console.error('Error deleting address:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Terjadi kesalahan jaringan.'
            });
          });
        }
      });
    }
  });

  // Initial load
  fetchUserProfile();
  fetchUserAddresses();

  // Modal close functionality for address modal
  const btnModalClose = addressModal.querySelector('.btn-modal-close');
  if (btnModalClose) {
    btnModalClose.addEventListener('click', () => {
      addressModal.classList.remove('active');
    });
  }
});a