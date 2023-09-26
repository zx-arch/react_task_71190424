// 4. Import dog env dari env.js
import dog_env from './env.js';
// Deklarasi
// 5. Deklarasi variable savedPetList dengan getItem dari localStorage
// Referensi : https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
const savedPetList = localStorage.getItem(`${dog_env.endpoint}/v1/images/search`);
// 6. JSON parse savedPetList karena local storage menyimpan value string
const petList = JSON.parse(savedPetList);

// 7. Buat instance untuk suatu search param (untuk pagination)
const searchParams = new URLSearchParams(window.location.search);

// 8. Ambil nilai dari suatu search param key bernama "page", default nilai = 1
const currentPage = searchParams.get("page") || 1;


// API Call
// 9. Buat suatu fungsi bernama getBreedsImage untuk melakukan pemanggilan API 
// menggunakan async await
// API URL : {dog_env.endpoint}/v1/images/search
// Query param : 
// a. include_categories = true, 
// b. include_breeds = true,
// c. has_breeds = true, 
// d. order=sesuaikan nilai sortBy dari parameter fungsi
// e. page = sesuaikan nilai dari currentPage
// f. limit = 10
// Method : GET
// headers : menyesuaikan dengan documentasi yang disediakan
// 9a. set sortBy dengan nilai default ascending (check di API docs bagaimana nilai ascending dan descending di definisikan pada query parameter order)

const getBreedsImage = async (sortBy = 'asc', currentPage) => {
  try {
    // Parameter query yang akan digunakan dalam URL
    const queryParams = new URLSearchParams({
      include_categories: true,
      include_breeds: true,
      has_breeds: true,
      order: sortBy, // Menggunakan nilai sortBy yang diberikan
      page: currentPage, // Menggunakan nilai currentPage yang diberikan
      limit: 10,
    });

    // API URL
    const apiUrl = `${dog_env.endpoint}/v1/images/search?${queryParams.toString()}`;
    console.log(apiUrl);
    // Membuat permintaan GET ke API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': dog_env.API_KEY, // Menggunakan API_KEY dari dog_env
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mendapatkan data dari API');
    }

    // Mengembalikan hasil respons dalam bentuk objek JSON
    return response.json();
  } catch (error) {
    // Menangani kesalahan jika terjadi
    console.error('Terjadi kesalahan dalam mengambil data:', error);
    throw error;
  }
};

// 10. Buat fungsi fetchImage untuk melakukan pemanggilan fungsi getBreedsImage sesuai sortBy yang dikirim
// supaya nilainya lebih dinamis
const fetchImage = (sortBy) => {
  // Panggil fungsi getBreedsImage dengan sortBy yang diberikan
  getBreedsImage(sortBy, currentPage)
    .then((images) => {
      // 10a. Ketika promise di-resolve, simpan hasil ke localStorage
      localStorage.setItem('petList', JSON.stringify(images));

      // 10b. Panggil fungsi render component dengan parameter images
      renderComponent(images);
    })
    .catch((error) => {
      // Tangani kesalahan jika terjadi selama pemanggilan getBreedsImage
      console.error('Terjadi kesalahan saat mengambil gambar:', error);
    });
};
fetchImage();

// 11. Definisikan selector untuk dropdown menu, search form, dan search input element
const dropdownElement = document.querySelector('.dropdownMenu'); // Selector untuk dropdown menu dengan class "dropdownMenu"
const formElement = document.querySelector('.searchForm'); // Selector untuk form dengan class "searchForm"
const searchInputElement = document.querySelector('.searchInput'); // Selector untuk input pencarian dengan class "searchInput"

// // pagination
// 12. Definisikan selector untuk pagination
const prevPage = document.querySelector('.prevPagination'); // Selector untuk tombol "Previous" dengan class "prevPagination"
const pageOne = document.querySelector('.pageOne'); // Selector untuk tombol halaman 1 dengan class "pageOne"
const pageTwo = document.querySelector('.pageTwo'); // Selector untuk tombol halaman 2 dengan class "pageTwo"
const pageThree = document.querySelector('.pageThree'); // Selector untuk tombol halaman 3 dengan class "pageThree"
const nextPage = document.querySelector('.nextPagination'); // Selector untuk tombol "Next" dengan class "nextPagination"


// // 13. Buat fungsi bernama petCardComponent untuk me render nilai dari hasil fetch data di endpoint
const PetCardComponent = (pet) => {
  // 13a. Tampilkan nilai dari breeds dari array ke 0
  const breedName = pet.breeds.length > 0 ? pet.breeds[0].name : 'Unknown';

  // 13b. Tampilkan hasil nilai sesuai dengan response yang didapatkan
  return `
    <div class="card my-3 mx-2" style="width: 20%">
      <img height="300" style="object-fit: cover" class="card-img-top" src="${pet.url}" alt="Card image cap" />
      <div class="card-body">
        <h5 class="card-title d-inline">${breedName}</h5>
        <p class="card-text">
          ${pet.description || 'No description available'}
        </p>
        <p>${pet.location || 'Location not specified'}</p>
        <span class="badge badge-pill badge-info">${pet.category || 'Category not specified'}</span>
        <span class="badge badge-pill badge-warning">Weight: ${pet.weight || 'Not specified'}</span>
        <span class="badge badge-pill badge-danger">Height: ${pet.height || 'Not specified'}</span>
      </div>
    </div>
  `;
};

const renderComponent = (filteredPet) => {
  document.querySelector(".petInfo").innerHTML = filteredPet
    .map((pet) => PetCardComponent(pet))
    .join("");
};

// // 14. buat fungsi sortPetById sesuai dengan key yang dipilih
const sortPetById = (key) => {
  if (key === "ascending") {
    // Panggil fungsi fetchImage dengan nilai "asc" (ascending) sesuai dengan dokumentasi API
    fetchImage("asc");
  }
  if (key === "descending") {
    // Panggil fungsi fetchImage dengan nilai "desc" (descending) sesuai dengan dokumentasi API
    fetchImage("desc");
  }
};

// // 15. searchPetByKey digunakan untuk melakukan search tanpa memanggil API, tetapi langsung
// // dari nilai petList
const searchPetByKey = (key) => {
  // 15a. mengembalikan filter dari petList sesuai dengan key yang diketikkan
  return petList.filter((pet) => {
    // Misalnya, kita akan mencocokkan dengan nama breed (ras) hewan peliharaan
    return pet.breeds.length > 0 && pet.breeds[0].name.toLowerCase().includes(key.toLowerCase());
  });
};

dropdownElement.addEventListener("change", (event) => {
  // 16. Buat fungsi untuk sorting
  event.preventDefault();
  const value = event.target.value;
  // 16a. Panggil fungsi sort dengan parameter value diatas
  sortPetById(value);
});

formElement.addEventListener("submit", (event) => {
  // 17. Buat fungsi untuk melakukan search
  event.preventDefault();
  const value = searchInputElement.value.trim().toLowerCase();
  const filteredPet = searchPetByKey(value);
  // 17a. panggil fungsi untuk merender komponen dengan parameter:
  // - filteredPet : ketika length filteredPet lebih dari 0
  // - petList: ketika length filteredPet = 0
  renderComponent(filteredPet.length > 0 ? filteredPet : petList);
});

// 18. FUngsi redirectTo untuk pagination
const redirectTo = (page) => {
  // 18a. Set search param "page" dengan nilai parameter page di atas
  searchParams.set("page", page);

  // 18b. Redirect dengan search param yang sudah didefinisikan
  window.location.search = searchParams.toString();
};

prevPage.addEventListener("click", (event) => {
  event.preventDefault();
  // 19. Jika currentPage > 1, redirect ke currentPage - 1 (pastikan parameter di-parse ke number)
  // dengan memanggil fungsi redirectTo, else redirect ke halaman 1
  const currentPage = parseInt(searchParams.get("page")) || 1; // Mendapatkan nilai currentPage dari parameter pencarian "page"

  if (currentPage > 1) {
    redirectTo(currentPage - 1); // Redirect ke halaman sebelumnya
  } else {
    redirectTo(1); // Redirect ke halaman 1 jika sudah di halaman pertama
  }
});


pageOne.addEventListener("click", (event) => {
  event.preventDefault();
  // 20. Memanggil fungsi redirectTo ke halaman 1
  redirectTo(1);
});

pageTwo.addEventListener("click", (event) => {
  event.preventDefault();
  // 21. Memanggil fungsi redirectTo ke halaman 2
  redirectTo(2);
});

pageThree.addEventListener("click", (event) => {
  event.preventDefault();
  // 22. Memanggil fungsi redirectTo ke halaman 3
  redirectTo(3);
});

nextPage.addEventListener("click", (event) => {
  event.preventDefault();
  // 23. Memanggil redirectTo ke page currentPage + 1 (jangan lupa diparse jadi number)
  const currentPage = parseInt(searchParams.get("page")) || 1; // Mendapatkan nilai currentPage dari parameter pencarian "page"
  redirectTo(currentPage + 1); // Redirect ke halaman berikutnya
});