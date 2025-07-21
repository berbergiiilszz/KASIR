const daftarBarang = [];
const daftarBarangEl = document.getElementById("daftarBarang");
const pilihBarangEl = document.getElementById("pilihBarang");
const totalHargaEl = document.getElementById("totalHarga");

// Fungsi untuk menampilkan daftar barang
function tampilkanBarang() {
  daftarBarangEl.innerHTML = "";
  pilihBarangEl.innerHTML = "";

  daftarBarang.forEach((barang, index) => {
    // Tampilkan di daftar stok
    const li = document.createElement("li");
    li.innerHTML = `${barang.nama} - Stok: ${barang.jumlah} - Rp ${barang.harga}`;
    daftarBarangEl.appendChild(li);

    // Tambahkan ke pilihan pembelian
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${barang.nama} (Rp ${barang.harga})`;
    pilihBarangEl.appendChild(option);
  });
}

// Tambah barang
document.getElementById("tambahBarang").addEventListener("click", () => {
  const nama = document.getElementById("namaBarang").value.trim();
  const jumlah = parseInt(document.getElementById("jumlahBarang").value);
  const harga = parseInt(document.getElementById("hargaBarang").value);

  if (!nama || isNaN(jumlah) || isNaN(harga) || jumlah <= 0 || harga <= 0) {
    alert("Mohon isi semua data dengan benar.");
    return;
  }

  daftarBarang.push({ nama, jumlah, harga });
  tampilkanBarang();

  document.getElementById("namaBarang").value = "";
  document.getElementById("jumlahBarang").value = "";
  document.getElementById("hargaBarang").value = "";
});

// Beli barang
document.getElementById("beliBarang").addEventListener("click", () => {
  const index = parseInt(pilihBarangEl.value);
  const jumlahBeli = parseInt(document.getElementById("jumlahBeli").value);

  if (isNaN(jumlahBeli) || jumlahBeli <= 0) {
    alert("Masukkan jumlah beli yang benar.");
    return;
  }

  const barang = daftarBarang[index];

  if (barang.jumlah < jumlahBeli) {
    alert("Stok tidak cukup.");
    return;
  }

  barang.jumlah -= jumlahBeli;
  const total = jumlahBeli * barang.harga;
  totalHargaEl.textContent = `Total harga: Rp ${total}`;

  tampilkanBarang();
  document.getElementById("jumlahBeli").value = "";
});

// Tampilkan data awal
tampilkanBarang();
