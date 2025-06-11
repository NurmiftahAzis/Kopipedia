// js/checkout.js

document.addEventListener('DOMContentLoaded', () => {
  const checkoutItemsContainer = document.getElementById('checkout-items');
  const checkoutTotalSpan = document.getElementById('checkout-total');
  const shippingAddressSelector = document.getElementById('shipping-address-selector');
  const paymentForm = document.getElementById('payment-form');
  const placeOrderBtn = document.getElementById('place-order-btn');

  let selectedAddressId = null;

  // Function to load cart items from localStorage and display them
  function loadCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('shopping-cart')) || [];
    checkoutItemsContainer.innerHTML = ''; // Clear existing items

    if (cartItems.length === 0) {
      checkoutItemsContainer.innerHTML = '<p class="empty-message">Tidak ada produk dalam keranjang</p>';
      checkoutTotalSpan.textContent = '0';
      placeOrderBtn.disabled = true; // Disable order button if cart is empty
      return;
    }

    let total = 0;
    cartItems.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'checkout-item';
      itemElement.innerHTML = `
        <div class="item-info">
          <img src="${item.image}" alt="${item.name}" class="item-image">
          <div class="item-details">
            <h4>${item.name}</h4>
            <span class="item-price">Rp${item.price.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div class="item-quantity">x1</div> `;
      checkoutItemsContainer.appendChild(itemElement);
      total += item.price;
    });

    checkoutTotalSpan.textContent = `Rp${total.toLocaleString('id-ID')}`;
    placeOrderBtn.disabled = false;
  }

  // Function to fetch and display user addresses for selection
  function fetchShippingAddresses() {
    fetch('php/get_addresses.php')
      .then(response => response.json())
      .then(data => {
        shippingAddressSelector.innerHTML = ''; // Clear existing addresses
        if (data.status === 'success' && data.addresses.length > 0) {
          data.addresses.forEach(address => {
            const addressOption = document.createElement('div');
            addressOption.className = 'address-option';
            addressOption.innerHTML = `
              <input type="radio" id="address-${address.id}" name="shipping-address" value="${address.id}">
              <label for="address-${address.id}">
                <div class="address-option-content">
                  <h4>${address.label}</h4>
                  <p>${address.recipient_name} (${address.recipient_phone})</p>
                  <p>${address.full_address}, ${address.postal_code}</p>
                </div>
              </label>
            `;
            shippingAddressSelector.appendChild(addressOption);
          });
          // Select the first address by default
          const firstAddressRadio = shippingAddressSelector.querySelector('input[type="radio"]');
          if (firstAddressRadio) {
            firstAddressRadio.checked = true;
            selectedAddressId = firstAddressRadio.value;
          }

          // Add event listener for address selection
          shippingAddressSelector.addEventListener('change', (e) => {
            if (e.target.name === 'shipping-address') {
              selectedAddressId = e.target.value;
            }
          });

        } else {
          shippingAddressSelector.innerHTML = '<p class="empty-message">Tidak ada alamat tersimpan</p>';
        }
        const addAddressLink = document.createElement('a');
        addAddressLink.href = 'profile.html'; // Link to profile to add address
        addAddressLink.className = 'button';
        addAddressLink.textContent = 'Tambah Alamat Baru';
        shippingAddressSelector.appendChild(addAddressLink);
      })
      .catch(error => {
        console.error('Error fetching shipping addresses:', error);
        shippingAddressSelector.innerHTML = '<p class="empty-message">Gagal memuat alamat pengiriman.</p>';
      });
  }

  // Handle payment form submission
  paymentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!selectedAddressId) {
      Swal.fire({
        icon: 'error',
        title: 'Alamat Pengiriman',
        text: 'Harap pilih alamat pengiriman terlebih dahulu.'
      });
      return;
    }

    const method = document.querySelector('input[name="payment-method"]:checked').value;
    const total = parseFloat(checkoutTotalSpan.textContent.replace('Rp', '').replace(/\./g, '').replace(/,/g, '')); // Clean up IDR format

    // Get cart items to send to backend for order_items table
    const cartItems = JSON.parse(localStorage.getItem('shopping-cart')) || [];
    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Keranjang Kosong',
        text: 'Tidak ada produk di keranjang Anda untuk di-checkout.'
      });
      return;
    }

    fetch("php/checkout.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `total=${total}&payment_method=${method}&address_id=${selectedAddressId}&cart_items=${JSON.stringify(cartItems)}`
    })
    .then(res => res.text())
    .then(data => {
      if (data === "success") {
        Swal.fire({
          icon: 'success',
          title: 'Pesanan Berhasil!',
          text: 'Pesanan Anda telah berhasil dibuat. Terima kasih telah berbelanja!'
        }).then(() => {
          localStorage.removeItem('shopping-cart'); // Clear cart after successful checkout
          window.location.href = "index.html";
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Checkout',
          text: 'Terjadi kesalahan saat membuat pesanan.'
        });
      }
    })
    .catch(error => {
      console.error('Error during checkout:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan jaringan saat checkout.'
      });
    });
  });

  // Initial load
  loadCartItems();
  fetchShippingAddresses();
});