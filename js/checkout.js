/ js/checkout.js

document.addEventListener('DOMContentLoaded', () => {
  const checkoutItemsContainer = document.getElementById('checkout-items');
  const checkoutTotalSpan = document.getElementById('checkout-total');
  const shippingAddressSelector = document.getElementById('shipping-address-selector');
  const paymentForm = document.getElementById('payment-form');
  const placeOrderBtn = document.getElementById('place-order-btn');

  let selectedAddressId = null;

  // Function to load cart items from localStorage and display them
  function loadCartItems() {
    // Ensure the cart items stored in localStorage also include product_id and quantity
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
          <img src="<span class="math-inline">\{item\.image\}" alt\="</span>{item.name}" class="item-image">
          <div class="item-details">
            <h4><span class="math-inline">\{item\.name\}</h4\>
<span class="item-price">Rp{item.price.toLocaleString('id-ID')}</span>
</div>
</div>
<div class="item-quantity">x${item.quantity || 1}</div> `; // Display quantity
checkoutItemsContainer.appendChild(itemElement);
total += item.price * (item.quantity || 1); // Calculate total with quantity
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
              <input type="radio" id="address-<span class="math-inline">\{address\.id\}" name\="shipping\-address" value\="</span>{address.id}">
              <label for="address-<span class="math-inline">\{address\.id\}"\>
<div class="address-option-content">
<h4>{address.label}</h4>
<p>address.recipient 
n
​
 ame({address.recipient_phone})</p>
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal memuat alamat pengiriman.'
        });
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
    // The total will be recalculated on the server for security, but send the frontend's total for initial check
    const total = parseFloat(checkoutTotalSpan.textContent.replace('Rp', '').replace(/\./g, '').replace(/,/g, ''));

    const cartItems = JSON.parse(localStorage.getItem('shopping-cart')) || [];
    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Keranjang Kosong',
        text: 'Tidak ada produk di keranjang Anda untuk di-checkout.'
      });
      return;
    }

    // Prepare cart items to send, ensuring product_id and quantity are included
    const itemsToSend = cartItems.map(item => ({
      id: item.id, // Assuming product ID is now stored in cart item
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1
    }));

    fetch("php/checkout.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `total=<span class="math-inline">\{total\}&payment\_method\=</span>{method}&address_id=<span class="math-inline">\{selectedAddressId\}&cart\_items\=</span>{JSON.stringify(itemsToSend)}`
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
        console.error('Checkout error response:', data);
        let errorMessage = 'Terjadi kesalahan saat membuat pesanan.';
        if (data === 'error_not_logged_in') {
            errorMessage = 'Anda belum login. Silakan login untuk melanjutkan.';
        } else if (data === 'error_db_connection') {
            errorMessage = 'Terjadi masalah koneksi database. Silakan coba lagi nanti.';
        } else if (data === 'error_empty_cart') {
            errorMessage = 'Keranjang Anda kosong.';
        } else if (data === 'error_checkout_failed') {
            errorMessage = 'Proses checkout gagal karena kesalahan internal.';
        }
        Swal.fire({
          icon: 'error',
          title: 'Gagal Checkout',
          text: errorMessage
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