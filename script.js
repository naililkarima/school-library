// Variabel global
let currentRole = '';
let books = JSON.parse(localStorage.getItem('books')) || []; // Daftar buku: {title, available: true/false}
let quizzes = JSON.parse(localStorage.getItem('quizzes')) || []; // Bank soal: {title, questions: [{question, options: [], correct}]}

// Fungsi untuk set peran
function setRole(role) {
    currentRole = role;
    document.getElementById('login').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    loadContent();
}

// Fungsi untuk load konten berdasarkan peran
function loadContent() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (currentRole === 'siswa') {
        content.innerHTML = `
            <h2>Menu Siswa</h2>
            <h3>Cari Buku</h3>
            <input type="text" id="searchBook" placeholder="Ketik judul buku">
            <button onclick="searchBook()">Cari</button>
            <div id="bookResults"></div>
            <h3>Kerjakan Quiz</h3>
            <select id="quizSelect"></select>
            <button onclick="startQuiz()">Mulai Quiz</button>
            <div id="quizContainer"></div>
        `;
        loadQuizzesForStudent();
    } else if (currentRole === 'guru') {
        content.innerHTML = `
            <h2>Menu Guru</h2>
            <h3>Buat Bank Soal</h3>
            <form id="quizForm">
                <input type="text" id="quizTitle" placeholder="Judul Quiz" required>
                <textarea id="questions" placeholder="Soal (format: Pertanyaan?Opsi1,Opsi2,Opsi3,JawabanBenar)" required></textarea>
                <button type="submit">Simpan Quiz</button>
            </form>
        `;
        document.getElementById('quizForm').addEventListener('submit', saveQuiz);
    } else if (currentRole === 'penjaga') {
        content.innerHTML = `
            <h2>Menu Penjaga Perpustakaan</h2>
            <h3>Kelola Buku</h3>
            <form id="bookForm">
                <input type="text" id="bookTitle" placeholder="Judul Buku" required>
                <button type="submit">Tambah Buku</button>
            </form>
            <ul id="bookList"></ul>
        `;
        document.getElementById('bookForm').addEventListener('submit', addBook);
        displayBooks();
    }
}

// Fungsi untuk siswa: Cari buku
function searchBook() {
    const query = document.getElementById('searchBook').value.toLowerCase();
    const results = books.filter(book => book.title.toLowerCase().includes(query));
    const resultsDiv = document.getElementById('bookResults');
    resultsDiv.innerHTML = results.map(book => 
        `<li>${book.title} - Status: ${book.available ? 'Tersedia' : 'Dipinjam'}</li>`
    ).join('');
}

// Fungsi untuk siswa: Load quiz
function loadQuizzesForStudent() {
    const select = document.getElementById('quizSelect');
    select.innerHTML = '<option>Pilih Quiz</option>' + quizzes.map((quiz, index) => 
        `<option value="${index}">${quiz.title}</option>`
    ).join('');
}

// Fungsi untuk siswa: Mulai quiz
function startQuiz() {
    const index = document.getElementById('quizSelect').value;
    if (index === 'Pilih Quiz') return;
    const quiz = quizzes[index];
    const container = document.getElementById('quizContainer');
    container.innerHTML = '';
    let score = 0;
    quiz.questions.forEach((q, i) => {
        container.innerHTML += `
            <p>${q.question}</p>
            ${q.options.map((opt, j) => `<input type="radio" name="q${i}" value="${j}"> ${opt}<br>`).join('')}
        `;
    });
    container.innerHTML += `<button onclick="submitQuiz(${index})">Submit</button>`;
}

// Fungsi untuk siswa: Submit quiz dan hitung skor
function submitQuiz(index) {
    const quiz = quizzes[index];
    let score = 0;
    quiz.questions.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected && parseInt(selected.value) === q.correct) score++;
    });
    document.getElementById('quizContainer').innerHTML += `<div class="quiz-result">Nilai Anda: ${score}/${quiz.questions.length}</div>`;
}

// Fungsi untuk guru: Simpan quiz
function saveQuiz(e) {
    e.preventDefault();
    const title = document.getElementById('quizTitle').value;
    const questionsText = document.getElementById('questions').value;
    const questions = questionsText.split('\n').map(line => {
        const parts = line.split('?');
        const q = parts[0];
        const opts = parts[1].split(',');
        return { question: q, options: opts.slice(0, -1), correct: parseInt(opts[opts.length - 1]) };
    });
    quizzes.push({ title, questions });
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    alert('Quiz disimpan!');
    document.getElementById('quizForm').reset();
}

// Fungsi untuk penjaga: Tambah buku
function addBook(e) {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value;
    books.push({ title, available: true });
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
    document.getElementById('bookForm').reset();
}

// Fungsi untuk penjaga: Tampilkan buku dan tombol aksi
function displayBooks() {
    const list = document.getElementById('bookList');
    list.innerHTML = books.map((book, index) => 
        `<li>${book.title} - ${book.available ? 'Tersedia' : 'Dipinjam'} 
        <button onclick="toggleBorrow(${index})">${book.available ? 'Tandai Dipinjam' : 'Tandai Kembali'}</button>
        <button onclick="deleteBook(${index})">Hapus</button></li>`
    ).join('');
}

// Fungsi untuk penjaga: Toggle status pinjam
function toggleBorrow(index) {
    books[index].available = !books[index].available;
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
}

// Fungsi untuk penjaga: Hapus buku
function deleteBook(index) {
    books.splice(index, 1);
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
}
