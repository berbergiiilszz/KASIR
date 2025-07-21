let barangList = [];
let penjualanList = [];
let keranjang = [];

window.onload = function() {
  const dataBarang = localStorage.getItem("barangList");
  const dataPenjualan = localStorage.getItem("penjualanList");

  if (dataBarang) barangList = JSON.parse(dataBarang);
  if (dataPenjualan) penjualanList = JSON.parse(dataPenjualan);

  renderTable();
  renderPenjualan();
  renderKeranjang();
};

function saveToLocalStorage() {
  localStorage.setItem("barangList", JSON.stringify(barangList));
  localStorage.setItem("penjualanList", JSON.stringify(penjualanList));
}

// Tambah Barang
function tambahBarang() {
  const nama = document.getElementById("namaBarang").value.trim();
  const stok = parseInt(document.getElementById("stokBarang").value);
  const harga = parseInt(document.getElementById("hargaBarang").value);
  const fileInput = document.getElementById("fotoBarangFile");
  const file = fileInput.files[0];

  if (!nama || isNaN(stok) || isNaN(harga)) {
    alert("Mohon isi semua data barang dengan benar!");
    return;
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const fotoBase64 = e.target.result;
      barangList.push({ nama, stok, harga, foto: fotoBase64 });
      saveToLocalStorage();
      renderTable();
      resetForm();
    };
    reader.readAsDataURL(file);
  } else {
    barangList.push({ nama, stok, harga, foto: "https://via.placeholder.com/60" });
    saveToLocalStorage();
    renderTable();
    resetForm();
  }
}

function resetForm() {
  document.getElementById("namaBarang").value = "";
  document.getElementById("stokBarang").value = "";
  document.getElementById("hargaBarang").value = "";
  document.getElementById("fotoBarangFile").value = "";
}

// Render Barang
function renderTable() {
  const tbody = document.querySelector("#tabelBarang tbody");
  tbody.innerHTML = "";

  barangList.forEach((barang, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${barang.foto}" alt="${barang.nama}"></td>
      <td>${barang.nama}</td>
      <td>${barang.stok}</td>
      <td>Rp ${barang.harga}</td>
      <td>
        <button class="btn btn-edit" onclick="editBarang(${index})">Edit</button>
        <button class="btn" onclick="hapusBarang(${index})">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Hapus Barang
function hapusBarang(index) {
  barangList.splice(index, 1);
  saveToLocalStorage();
  renderTable();
}

// Edit Barang
function editBarang(index) {
  const barang = barangList[index];
  const newStok = prompt(`Edit stok untuk ${barang.nama}:`, barang.stok);
  const newHarga = prompt(`Edit harga untuk ${barang.nama}:`, barang.harga);

  if (newStok !== null && newHarga !== null) {
    const stokValue = parseInt(newStok);
    const hargaValue = parseInt(newHarga);
    if (isNaN(stokValue) || isNaN(hargaValue)) {
      alert("Data stok/harga tidak valid!");
      return;
    }

    barangList[index].stok = stokValue;
    barangList[index].harga = hargaValue;
    saveToLocalStorage();
    renderTable();
    alert("Barang berhasil diupdate!");
  }
}

// Autocomplete Suggestions
document.getElementById("inputCariBarang").addEventListener("input", function() {
  const query = this.value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (query === "") {
    suggestions.style.display = "none";
    return;
  }

  const filtered = barangList.filter(b => b.nama.toLowerCase().includes(query));

  if (filtered.length === 0) {
    suggestions.style.display = "none";
    return;
  }

  filtered.forEach(item => {
    const div = document.createElement("div");
    div.textContent = `${item.nama} (Stok: ${item.stok})`;
    div.onclick = () => {
      document.getElementById("inputCariBarang").value = item.nama;
      suggestions.style.display = "none";
    };
    suggestions.appendChild(div);
  });

  suggestions.style.display = "block";
});

// Tambah ke Keranjang
function tambahKeranjang() {
  const namaBarang = document.getElementById("inputCariBarang").value.trim();
  const jumlah = parseInt(document.getElementById("jumlahBeli").value);

  if (!namaBarang || isNaN(jumlah) || jumlah <= 0) {
    alert("Masukkan nama barang dan jumlah pembelian yang valid!");
    return;
  }

  const barang = barangList.find(b => b.nama.toLowerCase() === namaBarang.toLowerCase());
  if (!barang) {
    alert("Barang tidak ditemukan di daftar!");
    return;
  }

  if (barang.stok < jumlah) {
    alert("Stok tidak cukup!");
    return;
  }

  const total = barang.harga * jumlah;
  const existing = keranjang.find(item => item.nama === barang.nama);

  if (existing) {
    existing.jumlah += jumlah;
    existing.total += total;
  } else {
    keranjang.push({ nama: barang.nama, jumlah, total, foto: barang.foto });
  }

  renderKeranjang();
  document.getElementById("jumlahBeli").value = "";
  document.getElementById("inputCariBarang").value = "";
}

// Render Keranjang
function renderKeranjang() {
  const tbody = document.querySelector("#tabelKeranjang tbody");
  tbody.innerHTML = "";

  let totalBelanja = 0;
  keranjang.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${item.foto}" alt="${item.nama}"></td>
      <td>${item.nama}</td>
      <td>${item.jumlah}</td>
      <td>Rp ${item.total}</td>
      <td><button class="btn" onclick="hapusKeranjang(${index})">Hapus</button></td>
    `;
    tbody.appendChild(tr);
    totalBelanja += item.total;
  });

  document.getElementById("totalKeranjang").innerText = "Total Belanja: Rp " + totalBelanja;
}

function hapusKeranjang(index) {
  keranjang.splice(index, 1);
  renderKeranjang();
}

// Checkout
function checkout() {
  if (keranjang.length === 0) {
    alert("Keranjang belanja kosong!");
    return;
  }

  let adaError = false;
  keranjang.forEach(item => {
    const barang = barangList.find(b => b.nama === item.nama);
    if (!barang) {
      alert(`Barang "${item.nama}" tidak ditemukan!`);
      adaError = true;
      return;
    }
    if (barang.stok < item.jumlah) {
      alert(`Stok untuk "${item.nama}" tidak cukup!`);
      adaError = true;
    }
  });

  if (adaError) return;

  // Update stok & simpan ke riwayat
  keranjang.forEach(item => {
    const barang = barangList.find(b => b.nama === item.nama);
    barang.stok -= item.jumlah;

    penjualanList.push({
      tanggal: new Date().toLocaleString("id-ID"),
      nama: item.nama,
      jumlah: item.jumlah,
      total: item.total,
      foto: item.foto
    });
  });

  keranjang = [];
  saveToLocalStorage();
  renderTable();
  renderKeranjang();
  renderPenjualan();
  alert("Checkout berhasil!");
}

// Render Penjualan
function renderPenjualan() {
  const tbody = document.querySelector("#tabelPenjualan tbody");
  tbody.innerHTML = "";

  let totalPemasukan = 0;
  penjualanList.forEach(penjualan => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${penjualan.foto}" alt="${penjualan.nama}"></td>
      <td>${penjualan.tanggal}</td>
      <td>${penjualan.nama}</td>
      <td>${penjualan.jumlah}</td>
      <td>Rp ${penjualan.total}</td>
    `;
    tbody.appendChild(tr);
    totalPemasukan += penjualan.total;
  });

  document.getElementById("totalPenjualan").innerText = "Total Pemasukan: Rp " + totalPemasukan;
}

// Reset Semua Data
function resetSemuaData() {
  if (confirm("Apakah kamu yakin ingin menghapus semua data?")) {
    barangList = [];
    penjualanList = [];
    keranjang = [];
    saveToLocalStorage();
    renderTable();
    renderKeranjang();
    renderPenjualan();
    alert("Semua data telah dihapus.");
  }
}
