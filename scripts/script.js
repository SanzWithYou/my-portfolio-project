// C:\xampp\htdocs\persiapan\script.js (atau path proyek Anda)

document.addEventListener("DOMContentLoaded", () => {
  // --- Navbar Toggle Logic (Untuk Mobile Responsif) ---
  const menuToggle = document.querySelector(".menu-toggle");
  const navigasiList = document.querySelector(".navigasi-list");

  if (menuToggle && navigasiList) {
    menuToggle.addEventListener("click", () => {
      navigasiList.classList.toggle("active");
      // Mengubah ikon hamburger menjadi X dan sebaliknya
      const icon = menuToggle.querySelector("i");
      if (navigasiList.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });

    // Tutup menu saat link navigasi diklik di mobile
    navigasiList.querySelectorAll(".navigasi-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (navigasiList.classList.contains("active")) {
          navigasiList.classList.remove("active");
          menuToggle.querySelector("i").classList.remove("fa-times");
          menuToggle.querySelector("i").classList.add("fa-bars");
        }
      });
    });
  }

  // --- Smooth Scrolling for Navigation Links ---
  document.querySelectorAll(".navigasi-link").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      // Kita tetap akan menggunakan smooth scroll bawaan browser untuk kemudahan dan performa.
      // Biarkan e.preventDefault() di-comment out agar ini berjalan.
      // e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      const mainNav = document.querySelector(".main-navigasi");
      const navbarHeight = mainNav ? mainNav.offsetHeight : 0;

      if (targetElement) {
        // Untuk smooth scroll bawaan browser, kita tidak perlu window.scrollTo() secara manual.
        // Browser akan menanganinya otomatis dengan 'scroll-behavior: smooth;' di CSS.

        // Hapus kelas 'active' dari semua link dan tambahkan ke link yang diklik
        // Ini penting agar link yang diklik langsung aktif sebelum ScrollSpy mengambil alih.
        document.querySelectorAll(".navigasi-link").forEach((link) => {
          link.classList.remove("active");
        });
        this.classList.add("active");
      }
    });
  });

  // --- ScrollSpy Logic ---
  const sections = document.querySelectorAll(
    "section[id='beranda'], section[id='tentang-saya'], section[id='layanan-saya'], section[id='kontak-saran']"
  );
  const navLinks = document.querySelectorAll(".navigasi-link");

  function activateNavLink() {
    let currentActiveSectionId = null;
    const scrollY = window.scrollY;
    const mainNav = document.querySelector(".main-navigasi");
    const navbarHeight = mainNav ? mainNav.offsetHeight : 0;

    // Offset Penyesuaian Kritis untuk ScrollSpy:
    // Nilai ini menentukan seberapa jauh bagian (section) harus masuk ke viewport
    // sebelum navbar link yang sesuai diaktifkan.
    // Semakin besar offset, semakin cepat link akan aktif saat section mendekati bagian atas.
    // Navbar Anda fixed, jadi kita harus mengkompensasi tinggi navbar.
    // Anda bisa sesuaikan angka '50' ini untuk feel yang pas.
    const scrollOffset = navbarHeight + 50;

    // Logika untuk mengaktifkan link yang berada di bagian paling atas
    // atau link yang sedang terlihat paling dominan di viewport.
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionTop = section.offsetTop - scrollOffset;
      const sectionBottom = sectionTop + section.offsetHeight;

      // Jika posisi scroll berada di antara sectionTop dan sectionBottom
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        currentActiveSectionId = section.getAttribute("id");
        break;
      }
    }

    // Jika tidak ada section yang aktif (misal di paling atas halaman sebelum section 1)
    // atau jika beranda adalah section pertama, pastikan "Beranda" aktif.
    if (
      !currentActiveSectionId &&
      scrollY < sections[0].offsetTop + sections[0].offsetHeight
    ) {
      currentActiveSectionId = "beranda";
    }

    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    if (currentActiveSectionId) {
      const correspondingLink = document.querySelector(
        `.navigasi-link[href="#${currentActiveSectionId}"]`
      );
      if (correspondingLink) {
        correspondingLink.classList.add("active");
      }
    }
  }

  // Event listener untuk scroll dan load
  window.addEventListener("scroll", activateNavLink);
  window.addEventListener("load", activateNavLink); // Pastikan link aktif saat halaman pertama kali dimuat
  window.addEventListener("resize", activateNavLink); // Update saat ukuran jendela berubah

  // --- Image Replacement Logic for .gambar-utama and gallery ---
  const mainImage = document.getElementById("gambarUtamaTampil");
  const galleryItems = document.querySelectorAll(".gambar-item");

  if (mainImage && galleryItems.length > 0) {
    function cleanMainImageClasses() {
      mainImage.classList.remove("fade-out", "fade-in");
      mainImage.style.opacity = "";
    }

    function updateSelectedThumbnail() {
      const currentMainImageSrc = mainImage.src;
      const currentMainImageFileName = currentMainImageSrc
        .split("/")
        .pop()
        .split("?")[0];

      galleryItems.forEach((item) => {
        const imgInItem = item.querySelector("img");
        const itemSrc = item.dataset.src || (imgInItem ? imgInItem.src : "");
        const itemFileName = itemSrc.split("/").pop().split("?")[0];

        item.classList.remove("is-selected");
        if (imgInItem) {
          imgInItem.style.filter = "grayscale(100%)";
        }

        if (itemFileName && currentMainImageFileName === itemFileName) {
          item.classList.add("is-selected");
          if (imgInItem) imgInItem.style.filter = "grayscale(0%)";
        }
      });
    }

    updateSelectedThumbnail();

    galleryItems.forEach((item) => {
      item.addEventListener("click", function () {
        if (!mainImage) return;

        const newSrc = this.dataset.src;
        const newAlt = this.querySelector("img")
          ? this.querySelector("img").alt
          : "";

        const currentMainImageFileName = mainImage.src
          .split("/")
          .pop()
          .split("?")[0];
        const newSrcFileName = newSrc.split("/").pop().split("?")[0];

        if (currentMainImageFileName === newSrcFileName) {
          return;
        }

        cleanMainImageClasses();
        mainImage.classList.add("fade-out");

        mainImage.addEventListener(
          "animationend",
          function fadeOutHandler() {
            this.removeEventListener("animationend", fadeOutHandler);
            cleanMainImageClasses();

            this.src = newSrc;
            this.alt = newAlt;

            this.classList.add("fade-in");

            this.addEventListener(
              "animationend",
              function fadeInHandler() {
                this.removeEventListener("animationend", fadeInHandler);
                cleanMainImageClasses();
                updateSelectedThumbnail();
              },
              {
                once: true,
              }
            );
          },
          {
            once: true,
          }
        );
      });
    });
  }

  // --- Modal Logic (GANTI GAMBAR GALERI) ---
  const tombolGantiGambar = document.getElementById("tombolGantiGambar");
  const gantiGambarModal = document.getElementById("gantiGambarModal");
  const modalChoiceButtons = document.getElementById("modalChoiceButtons");
  const cancelGantiGambar = document.getElementById("cancelGantiGambar");

  let selectedGalleryItemForChange = null;

  if (
    tombolGantiGambar &&
    gantiGambarModal &&
    modalChoiceButtons &&
    cancelGantiGambar
  ) {
    tombolGantiGambar.addEventListener("click", () => {
      modalChoiceButtons.innerHTML = "";

      if (galleryItems.length === 0) {
        const noItemsMessage = document.createElement("p");
        noItemsMessage.textContent =
          "Tidak ada gambar di galeri untuk diganti.";
        modalChoiceButtons.appendChild(noItemsMessage);
      } else {
        galleryItems.forEach((item, index) => {
          const button = document.createElement("button");
          button.classList.add("modal-choice-button");
          button.textContent = `Galeri ${index + 1}`;
          button.dataset.index = index;
          button.addEventListener("click", () => {
            selectedGalleryItemForChange = item;
            gantiGambarModal.classList.remove("active");

            const tempInputFile = document.createElement("input");
            tempInputFile.type = "file";
            tempInputFile.accept = "image/*";
            tempInputFile.style.display = "none";
            document.body.appendChild(tempInputFile);

            tempInputFile.addEventListener(
              "change",
              function handleFileChange() {
                if (
                  this.files &&
                  this.files[0] &&
                  selectedGalleryItemForChange
                ) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const newImageSrc = e.target.result;
                    const targetImgElement =
                      selectedGalleryItemForChange.querySelector("img");

                    if (targetImgElement) {
                      targetImgElement.src = newImageSrc;
                      selectedGalleryItemForChange.dataset.src = newImageSrc;

                      const currentMainImageSrc = mainImage.src;
                      const currentMainImageFileName = currentMainImageSrc
                        .split("/")
                        .pop()
                        .split("?")[0];
                      const targetGalleryImageFileName = targetImgElement.src
                        .split("/")
                        .pop()
                        .split("?")[0];

                      if (
                        currentMainImageFileName === targetGalleryImageFileName
                      ) {
                        mainImage.src = newImageSrc;
                        mainImage.alt = targetImgElement.alt;
                        cleanMainImageClasses();
                      }
                      updateSelectedThumbnail();
                    }
                  };
                  reader.readAsDataURL(this.files[0]);
                }
                tempInputFile.removeEventListener("change", handleFileChange);
                if (document.body.contains(tempInputFile)) {
                  document.body.removeChild(tempInputFile);
                }
              }
            );

            tempInputFile.click();
          });
          modalChoiceButtons.appendChild(button);
        });
      }
      gantiGambarModal.classList.add("active");
    });

    cancelGantiGambar.addEventListener("click", () => {
      gantiGambarModal.classList.remove("active");
      selectedGalleryItemForChange = null;
    });

    gantiGambarModal.addEventListener("click", (e) => {
      if (e.target === gantiGambarModal) {
        gantiGambarModal.classList.remove("active");
        selectedGalleryItemForChange = null;
      }
    });
  }

  // --- Scroll-to-Top/Bottom Button Logic ---
  const scrollButton = document.getElementById("scrollButton");

  if (scrollButton) {
    let isScrollingDown = true;

    window.addEventListener("scroll", () => {
      const scrollThreshold = 300;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const currentScrollPos = window.scrollY;

      if (currentScrollPos > scrollThreshold) {
        scrollButton.classList.add("show");
      } else {
        scrollButton.classList.remove("show");
      }

      if (scrollHeight - (currentScrollPos + clientHeight) < 100) {
        scrollButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        isScrollingDown = false;
      } else {
        scrollButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
        isScrollingDown = true;
      }
    });

    scrollButton.addEventListener("click", () => {
      if (isScrollingDown) {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });

    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollHeight > clientHeight + 300) {
      scrollButton.classList.add("show");
      if (scrollHeight - (window.scrollY + clientHeight) < 100) {
        scrollButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        isScrollingDown = false;
      } else {
        scrollButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
        isScrollingDown = true;
      }
    } else {
      scrollButton.classList.remove("show");
    }
  }

  // --- Intersection Observer for General Animations (Scroll-in/Scroll-out, Reversible) ---
  const elementsToAnimate = document.querySelectorAll(
    "[data-animation-class], .gambar-item"
  );

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.01,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const element = entry.target;
      const animationClass = element.dataset.animationClass;

      if (entry.isIntersecting) {
        if (animationClass) {
          element.classList.remove(`${animationClass}-hidden`);
          element.classList.add(`${animationClass}-visible`);
        } else if (element.classList.contains("gambar-item")) {
          element.classList.add("is-visible");
        }
      } else {
        if (animationClass) {
          element.classList.remove(`${animationClass}-visible`);
          element.classList.add(`${animationClass}-hidden`);
        } else if (element.classList.contains("gambar-item")) {
          element.classList.remove("is-visible");
        }
      }
    });
  }, observerOptions);

  elementsToAnimate.forEach((element) => {
    const animationClass = element.dataset.animationClass;
    if (animationClass) {
      element.classList.add(`${animationClass}-hidden`);
    } else if (element.classList.contains("gambar-item")) {
      element.classList.remove("is-visible");
    }
    observer.observe(element);
  });

  // --- Custom Scrollbar Logic ---
  const customScrollbar = document.getElementById("customScrollbar");
  if (customScrollbar) {
    const customThumb = customScrollbar.querySelector(
      ".custom-scrollbar-thumb"
    );
    let scrollbarTimeout;

    function showCustomScrollbar() {
      if (!customScrollbar.classList.contains("show-scrollbar")) {
        customScrollbar.classList.add("show-scrollbar");
      }
      clearTimeout(scrollbarTimeout);
      scrollbarTimeout = setTimeout(() => {
        customScrollbar.classList.remove("show-scrollbar");
      }, 1500);
    }

    function updateCustomThumbPosition() {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollHeight <= clientHeight) {
        customScrollbar.classList.remove("show-scrollbar");
        return;
      }

      const scrollTop = window.scrollY;
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

      const scrollbarTrackHeight = customScrollbar.clientHeight;
      const minThumbHeightPx = 40;
      const maxThumbHeightPx = scrollbarTrackHeight * 0.8;

      let thumbHeight = (clientHeight / scrollHeight) * scrollbarTrackHeight;
      thumbHeight = Math.max(
        minThumbHeightPx,
        Math.min(maxThumbHeightPx, thumbHeight)
      );

      customThumb.style.height = `${thumbHeight}px`;

      const thumbRange = scrollbarTrackHeight - thumbHeight;
      const thumbPosition = scrollPercentage * thumbRange;

      customThumb.style.top = `${thumbPosition}px`;
    }

    let isDragging = false;
    let startY;
    let startScrollTop;

    customThumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      startY = e.clientY;
      startScrollTop = window.scrollY;
      customThumb.classList.add("active");
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollTrackHeight =
        customScrollbar.offsetHeight - customThumb.offsetHeight;

      if (scrollTrackHeight <= 0) return;

      const scrollRatio = (docHeight - winHeight) / scrollTrackHeight;
      window.scrollTo(0, startScrollTop + deltaY * scrollRatio);
    });

    window.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        customThumb.classList.remove("active");
      }
    });

    window.addEventListener("scroll", function () {
      showCustomScrollbar();
      updateCustomThumbPosition();
    });

    updateCustomThumbPosition();
    customScrollbar.classList.remove("show-scrollbar");

    window.addEventListener("resize", function () {
      updateCustomThumbPosition();
      if (
        window.scrollY > 0 &&
        document.documentElement.scrollHeight >
          document.documentElement.clientHeight
      ) {
        showCustomScrollbar();
      }
    });
  }

  // --- Comment Section Logic ---
  const submitCommentBtn = document.getElementById("submitCommentBtn");
  const commenterName = document.getElementById("commenterName");
  const commentText = document.getElementById("commentText");
  const commentsDisplay = document.getElementById("commentsDisplay");
  const noCommentsYet = document.querySelector(".no-comments-yet");

  // GANTI DENGAN URL Vercel ASLI Anda setelah deployment selesai!
  // Contoh: const VERCEL_BASE_API_URL = "https://nama-unik-app-anda.vercel.app";
  // *** INI YANG PERLU ANDA GANTI DENGAN URL VERCEL ASLI ***
  const VERCEL_BASE_API_URL = "https://YOUR-VERCEL-APP-URL.vercel.app"; // <--- GANTI INI DENGAN URL ASLI DARI VERCEL!

  const API_URL_COMMENTS = `${VERCEL_BASE_API_URL}/api/comments`;
  const CONTACT_API_URL = `${VERCEL_BASE_API_URL}/api/contact`;

  async function loadComments() {
    try {
      const response = await fetch(API_URL_COMMENTS);
      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status} - ${response.statusText}`
        );
      }
      const comments = await response.json();

      commentsDisplay.innerHTML = "";

      if (comments.length > 0) {
        if (noCommentsYet) {
          noCommentsYet.style.display = "none";
        }
        comments.forEach((comment) => displayComment(comment));
      } else {
        if (noCommentsYet) {
          noCommentsYet.style.display = "block";
          if (!commentsDisplay.contains(noCommentsYet)) {
            commentsDisplay.appendChild(noCommentsYet);
          }
        }
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      if (commentsDisplay && commentsDisplay.innerHTML === "") {
        commentsDisplay.innerHTML =
          '<p class="error-message">Gagal memuat komentar. Pastikan server berjalan.</p>';
        if (noCommentsYet) noCommentsYet.style.display = "none";
      }
    }
  }

  async function submitCommentToServer(commentData) {
    try {
      const response = await fetch(API_URL_COMMENTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengirim komentar. Server error."
        );
      }

      console.log("Comment submitted successfully:", result.comment);
      await loadComments();

      commenterName.value = "";
      commentText.value = "";
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert(`Gagal mengirim komentar: ${error.message}`);
    }
  }

  function displayComment(comment) {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("user-comment");
    commentDiv.classList.add("fade-in");

    let commentDate = "Tanggal tidak tersedia";
    if (comment.timestamp) {
      try {
        commentDate = new Date(comment.timestamp).toLocaleString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        console.warn("Invalid timestamp for comment:", comment.timestamp);
        commentDate = "Tanggal tidak valid";
      }
    }

    commentDiv.innerHTML = `
                <p><strong>${comment.name}</strong></p>
                <p>${comment.comment_text}</p>
                <small>${commentDate}</small>
            `;
    if (commentsDisplay) {
      commentsDisplay.appendChild(commentDiv);
    }
  }

  if (submitCommentBtn && commenterName && commentText && commentsDisplay) {
    loadComments();

    submitCommentBtn.addEventListener("click", () => {
      const name = commenterName.value.trim();
      const text = commentText.value.trim();

      if (name && text) {
        submitCommentToServer({
          name,
          text,
        });
      } else {
        alert("Nama dan Komentar tidak boleh kosong!");
      }
    });
  }

  // --- Change Theme (Dark/Light Mode) Logic ---
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeToggleBtn) {
      if (theme === "dark") {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggleBtn.setAttribute("aria-label", "Switch to light mode");
      } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggleBtn.setAttribute("aria-label", "Switch to dark mode");
      }
    }
  }

  function initializeTheme() {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (prefersDarkScheme.matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  if (themeToggleBtn) {
    initializeTheme();

    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    });

    // Listen for changes in the user's OS theme preference
    prefersDarkScheme.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        // Only auto-switch if user hasn't explicitly set a theme
        setTheme(e.matches ? "dark" : "light");
      }
    });
  }

  // --- Contact Form Submission Logic ---
  const contactForm = document.getElementById("contactForm");
  const contactName = document.getElementById("contactName");
  const contactEmail = document.getElementById("contactEmail");
  const contactMessage = document.getElementById("contactMessage");
  const contactStatusMessage = document.getElementById("contactStatusMessage");

  if (
    contactForm &&
    contactName &&
    contactEmail &&
    contactMessage &&
    contactStatusMessage
  ) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = contactName.value.trim();
      const email = contactEmail.value.trim();
      const message = contactMessage.value.trim();

      if (!name || !email || !message) {
        contactStatusMessage.textContent = "Semua bidang harus diisi!";
        contactStatusMessage.style.color = "red";
        contactStatusMessage.style.display = "block";
        return;
      }

      contactStatusMessage.textContent = "Mengirim pesan...";
      contactStatusMessage.style.color = "orange";
      contactStatusMessage.style.display = "block";

      try {
        const response = await fetch(CONTACT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, message }),
        });

        const result = await response.json();

        if (response.ok) {
          contactStatusMessage.textContent =
            result.message || "Pesan berhasil terkirim!";
          contactStatusMessage.style.color = "green";
          contactForm.reset();
        } else {
          throw new Error(result.message || "Gagal mengirim pesan.");
        }
      } catch (error) {
        console.error("Error submitting contact form:", error);
        contactStatusMessage.textContent = `Error: ${error.message}`;
        contactStatusMessage.style.color = "red";
      } finally {
        setTimeout(() => {
          contactStatusMessage.style.display = "none";
        }, 5000);
      }
    });
  }
});
