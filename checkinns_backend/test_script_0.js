
    let editingProp = { hotel: null, restaurant: null, lounge: null };
    window.allHotels = [];
    window.allRestaurants = [];
    window.allLounges = [];

    function toggleTheme() {
      document.body.classList.toggle('light-mode');
      const icon = document.querySelector('.theme-toggle-btn i');
      if (document.body.classList.contains('light-mode')) {
        icon.className = 'fas fa-moon';
      } else {
        icon.className = 'fas fa-sun';
      }
    }

    const loginPage = document.getElementById('loginPage');
    const dashboardWrapper = document.getElementById('dashboardWrapper');
    let revenueChart = null;

    // Check for owner token (separate from user token)
    const ownerToken = localStorage.getItem('ownerToken');
    if (ownerToken) {
      loginPage.classList.add('hidden');
      dashboardWrapper.classList.add('active');
      loadDashboard();
    }

    function setTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('form-' + tab).classList.add('active');
    }

    // LOGIN
    document.getElementById('form-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('input-login-email').value;
      const password = document.getElementById('input-login-password').value;
      const errorDiv = document.getElementById('login-error');
      errorDiv.textContent = '';

      try {
        const res = await fetch('/api/owner/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        });
        const data = await res.json();

        if (!res.ok) {
          errorDiv.textContent = data.msg || 'Login failed';
          return;
        }

        localStorage.setItem('ownerToken', data.token);
        loginPage.classList.add('hidden');
        dashboardWrapper.classList.add('active');
        loadDashboard();
      } catch (err) {
        errorDiv.textContent = 'Error: ' + err.message;
      }
    });

    // SIGNUP
    document.getElementById('form-signup').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('input-signup-name').value;
      const email = document.getElementById('input-signup-email').value;
      const password = document.getElementById('input-signup-password').value;
      const errorDiv = document.getElementById('signup-error');
      errorDiv.textContent = '';

      try {
        const res = await fetch('/api/owner/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (!res.ok) {
          errorDiv.textContent = data.msg || 'Signup failed';
          return;
        }

        localStorage.setItem('ownerToken', data.token);
        loginPage.classList.add('hidden');
        dashboardWrapper.classList.add('active');
        loadDashboard();
      } catch (err) {
        errorDiv.textContent = 'Error: ' + err.message;
      }
    });

    async function loadDashboard() {
      const ownerToken = localStorage.getItem('ownerToken');

      // Decode token to get owner name
      const decoded = JSON.parse(atob(ownerToken.split('.')[1]));
      const ownerName = decoded.username;

      try {
        const res = await fetch('/api/owner/summary?owner=' + ownerName, {
          headers: { 'Authorization': 'Bearer ' + ownerToken }
        });
        const data = await res.json();

        document.getElementById('stat-hotels').textContent = data.counts.hotels;
        document.getElementById('stat-restaurants').textContent = data.counts.restaurants;
        document.getElementById('stat-lounges').textContent = data.counts.lounges;
        document.getElementById('stat-revenue').textContent = '$' + data.revenue.total.toLocaleString();

        // Draw revenue chart
        drawRevenueChart({
          hotel: data.revenue.hotel,
          restaurant: data.revenue.restaurant,
          lounge: data.revenue.lounge
        });

        // Load properties
        loadProperties();

        // Load reviews & analytics
        loadReviews();

        // Load bookings
        loadBookings();
      } catch (err) {
        console.error('Dashboard error:', err);
      }
    }

    async function loadBookings() {
      const ownerToken = localStorage.getItem('ownerToken');
      const decoded = JSON.parse(atob(ownerToken.split('.')[1]));

      const bookingsList = document.getElementById('bookings-list');
      try {
        const res = await fetch('/api/owner/bookings?owner=' + encodeURIComponent(decoded.username), {
          headers: { 'Authorization': 'Bearer ' + ownerToken }
        });
        const bookings = await res.json();

        if (!bookings.length) {
          bookingsList.innerHTML = '<p style="grid-column: 1/-1;">No bookings found for your properties yet.</p>';
          return;
        }

        bookingsList.innerHTML = bookings.map(b => {
          let statusColor = "orange";
          if (b.status === "confirmed") statusColor = "#3bd45a";
          if (b.status === "rejected") statusColor = "#ff5e7e";
          return `
          <div class="property-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
              <div class="property-name" style="margin:0;">${b.propertyName}</div>
              <span style="background:${statusColor}; color:${b.status === 'confirmed' ? '#111' : '#fff'}; padding:2px 8px; border-radius:12px; font-size:12px; font-weight:bold; text-transform:uppercase;">
                ${b.status}
              </span>
            </div>
            <div class="property-detail"><i class="fas fa-bed"></i> ${b.roomName}</div>
            <div class="property-detail"><i class="fas fa-user"></i> Guest: ${b.customerName}</div>
            <div class="property-detail"><i class="fas fa-calendar"></i> ${new Date(b.checkIn).toLocaleDateString()} -> ${new Date(b.checkOut).toLocaleDateString()}</div>
            <div class="property-detail"><i class="fas fa-comment-dollar"></i> $${b.totalPrice}</div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
              <button class="save-btn" onclick="updateBookingStatus('${b._id}', 'confirmed')" style="flex:1; padding:6px; font-size:12px; background:var(--ok);">Accept</button>
              <button class="save-btn" onclick="updateBookingStatus('${b._id}', 'rejected')" style="flex:1; padding:6px; font-size:12px; background:var(--err);">Reject</button>
            </div>
          </div>
        `}).join('');
      } catch (err) {
        bookingsList.innerHTML = '<p>Error loading bookings.</p>';
      }
    }

    async function updateBookingStatus(id, status) {
      if (!confirm("Are you sure you want to mark this booking as " + status + "?")) return;
      const ownerToken = localStorage.getItem('ownerToken');
      try {
        const res = await fetch(`/api/owner/bookings/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + ownerToken
          },
          body: JSON.stringify({ status })
        });
        if (res.ok) {
          alert('Booking status updated! An email has been sent to the customer with their updated booking status.');
          loadBookings(); // refresh list
        } else {
          alert('Failed to update status.');
        }
      } catch (err) {
        alert('Server error.');
      }
    }

    function drawRevenueChart(revenue) {
      try {
        const ctx = document.getElementById('revenueChart').getContext('2d');

        if (revenueChart) revenueChart.destroy();

        revenueChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Hotels', 'Restaurants', 'Lounges'],
            datasets: [{
              data: [revenue.hotel, revenue.restaurant, revenue.lounge],
              backgroundColor: ['#667eea', '#764ba2', '#a3b1ff'],
              borderColor: '#232756',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: { color: '#e8e9ff', font: { size: 14, weight: 'bold' } }
              }
            }
          }
        });
      } catch (err) {
        console.error('Could not draw chart:', err);
      }
    }

    async function loadProperties() {
      const ownerToken = localStorage.getItem('ownerToken');
      const decoded = JSON.parse(atob(ownerToken.split('.')[1]));
      const ownerName = decoded.username;

      const hotelsList = document.getElementById('hotels-list');
      const restaurantsList = document.getElementById('restaurants-list');
      const loungesList = document.getElementById('lounges-list');

      try {
        const query = '?owner=' + encodeURIComponent(ownerName);

        const [hotelsRes, restRes, loungesRes] = await Promise.all([
          fetch('/api/hotels' + query),
          fetch('/api/restaurants' + query),
          fetch('/api/lounges' + query)
        ]);

        const hotels = await hotelsRes.json();
        const restaurants = await restRes.json();
        const lounges = await loungesRes.json();

        window.allHotels = hotels;
        window.allRestaurants = restaurants;
        window.allLounges = lounges;

        hotelsList.innerHTML = hotels.length ? hotels.map(h => `
          <div class="property-card">
            <div class="property-name">${h.name}</div>
            <div class="property-detail"><i class="fas fa-map-marker-alt"></i> ${h.location}</div>
            <div class="property-detail"><i class="fas fa-dollar-sign"></i> \$${h.pricePerNight} / night</div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
              <button class="save-btn" onclick="editProperty('hotel', '${h._id}')" style="padding: 6px 12px; font-size: 12px; background:var(--accent);">Edit</button>
              <button class="save-btn" onclick="deleteProperty('hotel', '${h._id}')" style="padding: 6px 12px; font-size: 12px; background:var(--err);">Delete</button>
            </div>
          </div>
          `).join('') : '<p style="grid-column: 1/-1;">No hotels yet. Create your first property to get started.</p>';

        restaurantsList.innerHTML = restaurants.length ? restaurants.map(r => `
          <div class="property-card">
            <div class="property-name">${r.name}</div>
            <div class="property-detail"><i class="fas fa-map-marker-alt"></i> ${r.location}</div>
            <div class="property-detail"><i class="fas fa-utensils"></i> ${r.cuisines?.join(', ')}</div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
              <button class="save-btn" onclick="editProperty('restaurant', '${r._id}')" style="padding: 6px 12px; font-size: 12px; background:var(--accent);">Edit</button>
              <button class="save-btn" onclick="deleteProperty('restaurant', '${r._id}')" style="padding: 6px 12px; font-size: 12px; background:var(--err);">Delete</button>
            </div>
          </div>
          `).join('') : '<p style="grid-column: 1/-1;">No restaurants yet. Create your first property to get started.</p>';

        loungesList.innerHTML = lounges.length ? lounges.map(l => `
          <div class="property-card">
            <div class="property-name">${l.name}</div>
            <div class="property-detail"><i class="fas fa-map-marker-alt"></i> ${l.location}</div>
            <div class="property-detail"><i class="fas fa-glass-martini-alt"></i> ${l.features?.join(', ')}</div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
              <button class="save-btn" onclick="editProperty('lounge', '${l._id}')" style="padding: 6px 12px; font-size: 12px; background:var(--accent);">Edit</button>
              <button class="save-btn" onclick="deleteProperty('lounge', '${l._id}')" style="padding: 6px 12px; font-size: 12px; background:var(--err);">Delete</button>
            </div>
          </div>
          `).join('') : '<p style="grid-column: 1/-1;">No lounges yet. Create your first property to get started.</p>';

      } catch (err) {
        console.error('Error fetching properties:', err);
      }
    }

    let globalRatingsChart = null;

    async function loadReviews() {
      const ownerToken = localStorage.getItem('ownerToken');
      const decoded = JSON.parse(atob(ownerToken.split('.')[1]));
      const ownerName = decoded.username;

      try {
        const res = await fetch('/api/owner/reviews?owner=' + ownerName, {
          headers: { 'Authorization': 'Bearer ' + ownerToken }
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to load reviews");

        // Update Overview Stats
        document.getElementById('stat-total-reviews').textContent = data.stats.totalReviews;
        document.getElementById('stat-avg-rating').innerHTML = data.stats.avgRating + ' <i class="fas fa-star" style="font-size: 0.8em;"></i>';

        try {
          const ctx = document.getElementById('ratingsChart').getContext('2d');
          if (globalRatingsChart) globalRatingsChart.destroy();

          const distLabels = ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];
          const distData = [
            data.stats.distribution['5'] || 0,
            data.stats.distribution['4'] || 0,
            data.stats.distribution['3'] || 0,
            data.stats.distribution['2'] || 0,
            data.stats.distribution['1'] || 0
          ];

          globalRatingsChart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: distLabels,
              datasets: [{
                label: 'Number of Reviews',
                data: distData,
                backgroundColor: 'rgba(158, 139, 255, 0.6)',
                borderColor: 'rgba(158, 139, 255, 1)',
                borderWidth: 1,
                borderRadius: 4
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: '#e8e9ff' }, grid: { display: false } },
                y: { ticks: { color: '#e8e9ff' }, grid: { display: false } }
              }
            }
          });
        } catch (err) {
          console.error('Failed to draw ratings chart', err);
        }        // List Recent Reviews
        const listEl = document.getElementById('owner-reviews-list');
        if (data.reviews.length === 0) {
          listEl.innerHTML = '<p style="color: var(--muted);">No reviews yet. Check back later!</p>';
        } else {
          listEl.innerHTML = data.reviews.map(r => `
          <div style="background: rgba(255, 255, 255, .05); border: 1px solid #232756; border-radius: 8px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <strong style="color: var(--accent);">${r.propertyName} <span style="font-size: 0.8em; color: var(--muted);">(${r.propertyType})</span></strong>
                <span class="stars" style="color: #ffd700; font-size: 0.9em;">
                  ${'<i class="fas fa-star"></i>'.repeat(Math.round(r.rating))}${'<i class="far fa-star"></i>'.repeat(5 - Math.round(r.rating))}
                </span>
              </div>
              <p style="margin: 0 0 12px 0; color: var(--text);">${r.comment}</p>
              <div style="font-size: 0.85em; color: var(--muted); display: flex; justify-content: space-between;">
                <span>By: ${r.user}</span>
                <span>${new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          `).join('');
        }

      } catch (err) {
        console.error("Error loading reviews:", err);
      }
    }

    function showSection(section) {
      document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
      document.getElementById(section + '-section').classList.add('active');
      event.target.classList.add('active');
    }

    async function deleteProperty(type, id) {
      if (!confirm('Are you sure you want to delete this property?')) return;
      const ownerToken = localStorage.getItem('ownerToken');
      try {
        const res = await fetch(`/api/${type}s/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + ownerToken }
        });
        if (res.ok) {
          alert('Property deleted.');
          loadDashboard();
        } else {
          alert('Failed to delete.');
        }
      } catch (e) { alert('Error: ' + e.message); }
    }

    function editProperty(type, id) {
      if (type === 'hotel') {
        const h = window.allHotels.find(x => x._id === id);
        if (!h) return;
        editingProp.hotel = id;
        document.getElementById('hotel-name').value = h.name;
        document.getElementById('hotel-location').value = h.location;
        document.getElementById('hotel-price').value = h.pricePerNight;
        document.getElementById('hotel-description').value = h.description;

        document.getElementById('hotel-amenities-container').innerHTML = '<label>Amenities</label>';
        if (h.amenities && h.amenities.length > 0) {
          h.amenities.forEach(a => {
            const div = document.createElement('div');
            div.className = 'amenity-entry';
            div.style.cssText = 'display:flex; gap:10px; margin-bottom:10px; align-items:center;';
            div.innerHTML = `
              <input type="text" class="hotel-amenity-name" value="${a.name}" placeholder="Amenity name" required style="flex:1;">
              <label style="margin:0;"><input type="checkbox" class="hotel-amenity-paid" ${a.isPaid ? 'checked' : ''} onchange="this.parentElement.nextElementSibling.style.display=this.checked?'block':'none'"> Paid?</label>
              <input type="number" class="hotel-amenity-price" value="${a.price || 0}" placeholder="Price $" style="display:${a.isPaid ? 'block' : 'none'}; width:80px;">
              <button type="button" onclick="this.parentElement.remove()" style="background:var(--err); color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">X</button>
            `;
            document.getElementById('hotel-amenities-container').appendChild(div);
          });
        }
        const roomsContainer = document.getElementById('hotel-rooms-container');
        roomsContainer.innerHTML = '';
        if (h.rooms && h.rooms.length > 0) {
          h.rooms.forEach(r => {
            roomsContainer.insertAdjacentHTML('beforeend', `
          <div class="room-entry" style="border: 1px solid #232756; padding: 15px; border-radius: 8px; margin-bottom: 15px; background: rgba(255,255,255,0.02); position: relative;">
                <button type="button" class="remove-room-btn" onclick="this.parentElement.remove()" style="position:absolute; top:10px; right:10px; background:var(--err); color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer;">X</button>
                <div class="form-group"><label>Room Type Name</label><input type="text" class="hotel-room-name" value="${r.name || ''}" placeholder="e.g. Standard Room, Suite"></div>
                <div class="form-group"><label>Room Price ($)</label><input type="number" class="hotel-room-price" value="${r.price || ''}"></div>
                <div class="form-group"><label>Room Description</label><textarea class="hotel-room-description" placeholder="Room details...">${r.description || ''}</textarea></div>
                <div class="form-group"><label>Total Rooms (Quantity)</label><input type="number" class="hotel-room-qty" value="${r.totalRooms || 10}"></div>
              </div>
          `);
          });
        } else {
          addHotelRoomField();
        }
        showSection('hotels');
        showHotelForm();
        window.scrollTo(0, 0);
      } else if (type === 'restaurant') {
        const r = window.allRestaurants.find(x => x._id === id);
        if (!r) return;
        editingProp.restaurant = id;
        document.getElementById('rest-name').value = r.name;
        document.getElementById('rest-location').value = r.location;
        document.getElementById('rest-cuisine').value = (r.cuisines || []).join(', ');
        document.getElementById('rest-price').value = r.priceRange || '$$';
        document.getElementById('rest-description').value = r.description;
        showSection('restaurants');
        showRestaurantForm();
        window.scrollTo(0, 0);
      } else if (type === 'lounge') {
        const l = window.allLounges.find(x => x._id === id);
        if (!l) return;
        editingProp.lounge = id;
        document.getElementById('lounge-name').value = l.name;
        document.getElementById('lounge-location').value = l.location;
        document.getElementById('lounge-price').value = l.priceRange || '';
        document.getElementById('lounge-description').value = l.description;
        if (l.features && l.features.length) document.getElementById('lounge-type').value = l.features[0];
        showSection('lounges');
        showLoungeForm();
        window.scrollTo(0, 0);
      }
    }

    function logoutOwner() {
      localStorage.removeItem('ownerToken');
      loginPage.classList.remove('hidden');
      dashboardWrapper.classList.remove('active');
      document.getElementById('form-login').reset();
      document.getElementById('form-signup').reset();
      document.getElementById('login-error').textContent = '';
      document.getElementById('signup-error').textContent = '';
    }

    // ========== FILE UPLOAD HANDLERS ==========
    const uploadedFiles = { hotel: [], restaurant: [], lounge: [] };

    function handleDragOver(e) {
      e.preventDefault();
      e.currentTarget.classList.add('dragover');
    }

    function handleDragLeave(e) {
      e.currentTarget.classList.remove('dragover');
    }

    function handleDrop(e, type) {
      e.preventDefault();
      e.currentTarget.classList.remove('dragover');
      const files = e.dataTransfer.files;
      handleFileSelect({ target: { files: files, dataset: { type } }, preventDefault: () => { } }, type);
    }

    function handleFileSelect(e, type) {
      const files = Array.from(e.target.files);
      const container = document.getElementById(type + '-upload');
      const previewDiv = document.getElementById(type + '-previews');

      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          uploadedFiles[type].push(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            const imgDiv = document.createElement('div');
            imgDiv.className = 'preview-container';
            imgDiv.innerHTML = `<img src="${event.target.result}" class="preview-img"><button type="button" class="remove-img" onclick="removeFile(this, '${type}')">×</button>`;
            previewDiv.appendChild(imgDiv);
          };
          reader.readAsDataURL(file);
        }
      });

      container.querySelector('input[type="file"]').value = '';
    }

    function removeFile(btn, type) {
      const index = Array.from(document.getElementById(type + '-previews').querySelectorAll('.preview-container')).indexOf(btn.parentElement);
      uploadedFiles[type].splice(index, 1);
      btn.parentElement.remove();
    }

    async function uploadImages(files) {
      if (files.length === 0) return [];
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        return data.files || [];
      } catch (err) {
        alert('Image upload failed: ' + err.message);
        return [];
      }
    }

    // ========== FORM HANDLERS ==========
    function showHotelForm() { document.getElementById('hotel-form-container').style.display = 'block'; }
    function showRestaurantForm() { document.getElementById('restaurant-form-container').style.display = 'block'; }
    function showLoungeForm() { document.getElementById('lounge-form-container').style.display = 'block'; }

    function addHotelAmenityField() {
      const container = document.getElementById('hotel-amenities-container');
      const div = document.createElement('div');
      div.className = 'amenity-entry';
      div.style.cssText = 'display:flex; gap:10px; margin-bottom:10px; align-items:center;';
      div.innerHTML = `
        <input type="text" class="hotel-amenity-name" placeholder="Amenity name" required style="flex:1;">
        <label style="margin:0;"><input type="checkbox" class="hotel-amenity-paid" onchange="this.parentElement.nextElementSibling.style.display=this.checked?'block':'none'"> Paid?</label>
        <input type="number" class="hotel-amenity-price" placeholder="Price $" style="display:none; width:80px;">
        <button type="button" onclick="this.parentElement.remove()" style="background:var(--err); color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">X</button>
      `;
      container.appendChild(div);
    }

    function addHotelRoomField() {
      const container = document.getElementById('hotel-rooms-container');
      container.insertAdjacentHTML('beforeend', `
          <div class="room-entry" style="border: 1px solid #232756; padding: 15px; border-radius: 8px; margin-bottom: 15px; background: rgba(255,255,255,0.02); position: relative;">
          <button type="button" class="remove-room-btn" onclick="this.parentElement.remove()" style="position:absolute; top:10px; right:10px; background:var(--err); color:white; border:none; border-radius:4px; padding:4px 8px; cursor:pointer;">X</button>
          <div class="form-group"><label>Room Type Name</label><input type="text" class="hotel-room-name" placeholder="e.g. Standard Room, Suite"></div>
          <div class="form-group"><label>Room Price ($)</label><input type="number" class="hotel-room-price"></div>
          <div class="form-group"><label>Room Description</label><textarea class="hotel-room-description" placeholder="Room details..."></textarea></div>
          <div class="form-group"><label>Total Rooms (Quantity)</label><input type="number" class="hotel-room-qty" value="10"></div>
        </div>
          `);
    }

    document.getElementById('hotelForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';

      let images = await uploadImages(uploadedFiles.hotel);
      const ownerToken = localStorage.getItem('ownerToken');
      const decoded = JSON.parse(atob(ownerToken.split('.')[1]));
      const location = document.getElementById('hotel-location').value;

      const isEditing = !!editingProp.hotel;
      let finalImages = images;
      let mainImage = images.length > 0 ? images[0] : '';
      if (isEditing) {
        const existingHotel = window.allHotels.find(h => h._id === editingProp.hotel);
        if (existingHotel && images.length === 0) {
          finalImages = existingHotel.images || [];
          mainImage = existingHotel.mainImage || '';
        }
      }

      const hotelData = {
        name: document.getElementById('hotel-name').value,
        country: location.split(',').pop().trim() || 'Unknown',
        location: location,
        pricePerNight: parseFloat(document.getElementById('hotel-price').value),
        description: document.getElementById('hotel-description').value,
        amenities: Array.from(document.querySelectorAll('.amenity-entry')).map(entry => {
          return {
            name: entry.querySelector('.hotel-amenity-name').value,
            isPaid: entry.querySelector('.hotel-amenity-paid').checked,
            price: parseFloat(entry.querySelector('.hotel-amenity-price').value) || 0
          };
        }).filter(a => a.name.trim() !== ''),
        rooms: Array.from(document.querySelectorAll('.room-entry')).map(entry => {
          return {
            name: entry.querySelector('.hotel-room-name').value,
            price: entry.querySelector('.hotel-room-price').value || 0,
            description: entry.querySelector('.hotel-room-description').value,
            totalRooms: parseInt(entry.querySelector('.hotel-room-qty').value) || 10
          };
        }).filter(r => r.name.trim() !== ''),
        owner: decoded.username,
        mainImage: mainImage,
        images: finalImages
      };

      try {
        const res = await fetch(isEditing ? `/api/hotels/${editingProp.hotel}` : '/api/hotels', {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ownerToken },
          body: JSON.stringify(hotelData)
        });
        const data = await res.json();
        if (res.ok) {
          alert('Hotel saved successfully!');
          editingProp.hotel = null;
          document.getElementById('hotel-form-container').style.display = 'none';
          document.getElementById('hotelForm').reset();
          uploadedFiles.hotel = [];
          document.getElementById('hotel-previews').innerHTML = '';
          loadDashboard();
        } else {
          alert('Error: ' + JSON.stringify(data));
        }
      } catch (err) {
        alert('Fetch Error: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });

    document.getElementById('restaurantForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';

      let images = await uploadImages(uploadedFiles.restaurant);
      const ownerToken = localStorage.getItem('ownerToken');
      const decoded = JSON.parse(atob(ownerToken.split('.')[1]));

      const isEditing = !!editingProp.restaurant;
      let finalImages = images;
      let mainImage = images.length > 0 ? images[0] : '';
      if (isEditing) {
        const existingRest = window.allRestaurants.find(r => r._id === editingProp.restaurant);
        if (existingRest && images.length === 0) {
          finalImages = existingRest.images || [];
          mainImage = existingRest.mainImage || '';
        }
      }

      const restData = {
        name: document.getElementById('rest-name').value,
        location: document.getElementById('rest-location').value,
        cuisines: document.getElementById('rest-cuisine').value.split(',').map(c => c.trim()),
        priceRange: document.getElementById('rest-price').value,
        description: document.getElementById('rest-description').value,
        owner: decoded.username,
        mainImage: mainImage,
        images: finalImages
      };

      try {
        const res = await fetch(isEditing ? `/api/restaurants/${editingProp.restaurant}` : '/api/restaurants', {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ownerToken },
          body: JSON.stringify(restData)
        });
        const data = await res.json();
        if (res.ok) {
          alert('Restaurant saved successfully!');
          editingProp.restaurant = null;
          document.getElementById('restaurant-form-container').style.display = 'none';
          document.getElementById('restaurantForm').reset();
          uploadedFiles.restaurant = [];
          document.getElementById('restaurant-previews').innerHTML = '';
          loadDashboard();
        } else {
          alert('Error: ' + JSON.stringify(data));
        }
      } catch (err) {
        alert('Fetch Error: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });

    document.getElementById('loungeForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';

      let images = await uploadImages(uploadedFiles.lounge);
      const ownerToken = localStorage.getItem('ownerToken');
      const decoded = JSON.parse(atob(ownerToken.split('.')[1]));

      const isEditing = !!editingProp.lounge;
      let finalImages = images;
      let mainImage = images.length > 0 ? images[0] : '';
      if (isEditing) {
        const existingLounge = window.allLounges.find(l => l._id === editingProp.lounge);
        if (existingLounge && images.length === 0) {
          finalImages = existingLounge.images || [];
          mainImage = existingLounge.mainImage || '';
        }
      }

      const loungeData = {
        name: document.getElementById('lounge-name').value,
        location: document.getElementById('lounge-location').value,
        features: [document.getElementById('lounge-type').value],
        priceRange: document.getElementById('lounge-price').value,
        description: document.getElementById('lounge-description').value,
        owner: decoded.username,
        mainImage: mainImage,
        images: finalImages
      };

      try {
        const res = await fetch(isEditing ? `/api/lounges/${editingProp.lounge}` : '/api/lounges', {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ownerToken },
          body: JSON.stringify(loungeData)
        });
        const data = await res.json();
        if (res.ok) {
          alert('Lounge saved successfully!');
          editingProp.lounge = null;
          document.getElementById('lounge-form-container').style.display = 'none';
          document.getElementById('loungeForm').reset();
          uploadedFiles.lounge = [];
          document.getElementById('lounge-previews').innerHTML = '';
          loadDashboard();
        } else {
          alert('Error: ' + JSON.stringify(data));
        }
      } catch (err) {
        alert('Fetch Error: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  