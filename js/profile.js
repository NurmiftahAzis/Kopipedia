/profile.js

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
    fetch('php/get_user_info.php')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          const user = data.user;
          profileName.textContent = user.fullname;
          profileEmail.textContent = user.email;
          profilePhone.textContent = user.phone;
          profileDate.textContent = new Date(user.created_at).toLocaleDateString('id-ID'); // Format date

          // Store user info in localStorage for auth.js to use for displaying name in navbar
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
    fetch('php/get_addresses.php')
      .then(response => response.json())
      .then(data => {
        addressList.innerHTML = ''; // Clear previous addresses
        if (data.status === 'success' && data.addresses.length > 0) {
          data.addresses.forEach(address => {
            const addressCard = document.createElement('div');
            addressCard.className = 'address-card';
            addressCard.innerHTML = `
              <div class="address-header">
                <h4><span class="math-inline">\{address\.label\}</h4\>
<div class="address-actions">
<button type="button" class="edit-address-btn" data-id="{address.id}">
<i data-feather="edit"></i>
</button>
<button type="button" class="delete-address-btn" data-id="address.id"><idata−feather="trash−2"></i></button></div></div><divclass="address−details"><p>{address.recipient_name} (address.recipient 
p
​
 hone)</p><p>{address.full_address}, ${address.postal_code}</p>
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
Swal.fire({
icon: 'error',
title: 'Error',
text: 'Gagal memuat alamat.'
});
addressList.innerHTML = '<p class="empty-message">Gagal memuat alamat.</p>';
});
}

  // Event listener for "Tambah Alamat Baru" button
  addAddressBtn.addEventListener('click', () => {
    // Reset form for new address
    addressForm.reset();
    addressIdInput.value = ''; // Clear address ID for new entry (indicates add mode)
    addressModal.querySelector('h3').textContent = 'Tambah Alamat Baru';
    addressModal.classList.add('active');
  });

  // Event listener for address form submission (Add/Edit)
  addressForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const id = addressIdInput.value; // Will be empty for new, has value for edit
    const label = document.getElementById('address-label').value;
    const recipientName = document.getElementById('recipient-name').value;
    const recipientPhone = document.getElementById('recipient-phone').value;
    const fullAddress = document.getElementById('address-detail').value;
    const postalCode = document.getElementById('postal-code').value;

    // Use a single PHP file for both add and update based on 'id' parameter
    const url = 'php/add_address.php'; // This file is now updated to handle both
    
    let formData = `label=<span class="math-inline">\{label\}&recipient\_name\=</span>{recipientName}&recipient_phone=<span class="math-inline">\{recipientPhone\}&full\_address\=</span>{fullAddress}&postal_code=${postalCode}`;
    if (id) {
        formData += `&id=${id}`; // Include ID if updating
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
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
        console.error('Address save error response:', data);
        let errorMessage = 'Terjadi kesalahan saat menyimpan alamat.';
        if (data === 'error_not_logged_in') {
            errorMessage = 'Anda belum login. Silakan login terlebih dahulu.';
        } else if (data === 'error_db_connection') {
            errorMessage = 'Terjadi masalah koneksi database. Silakan coba lagi nanti.';
        } else if (data === 'error_save_failed') {
            errorMessage = 'Gagal menyimpan alamat karena kesalahan server.';
        }
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: errorMessage
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
      fetch(`php/get_address_detail.php?id=${addressId}`)
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
            console.error('Address detail error response:', data);
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Alamat tidak ditemukan atau Anda tidak memiliki izin.'
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
          fetch('php/delete_address.php', {
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
              console.error('Delete address error response:', data);
              let errorMessage = 'Terjadi kesalahan saat menghapus alamat.';
              if (data === 'error_not_logged_in') {
                errorMessage = 'Anda belum login.';
              } else if (data === 'error_db_connection') {
                errorMessage = 'Terjadi masalah koneksi database.';
              }
              Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: errorMessage
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
});