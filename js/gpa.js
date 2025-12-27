document.addEventListener('DOMContentLoaded', () => {
  const systemSelect = document.getElementById('gradingSystem');
  const isMobile = window.innerWidth < 1024;

const subjectInput = document.getElementById(isMobile ? 'subject-mobile' : 'subject');
const addBtn = document.getElementById(isMobile ? 'addBtn-mobile' : 'addBtn');
const list = document.getElementById(isMobile ? 'coursesList-mobile' : 'coursesList');
const gpaEl = document.getElementById(isMobile ? 'gpaValue-mobile' : 'gpaValue');
const resetBtn = document.getElementById(isMobile ? 'resetBtn-mobile' : 'resetBtn');



  // Grade elements
  const gradeSelectPC = document.getElementById('grade-pc');
  const gradeSelectMobile = document.getElementById('grade-mobile');
  const gradeDisplay = document.getElementById('gradeDisplay');
  const gradeOptions = document.getElementById('gradeOptions');

  let courses = [];
  let currentSystem = '5.0';
  let selectedGradeValue = null;
  let selectedGradeText = '';

  const gradingSystems = {
    '5.0': [
      { text: '5 (Excellent)', value: 5 },
      { text: '4 (Good)', value: 4 },
      { text: '3 (Satisfactory)', value: 3 },
      { text: '2 (Fail)', value: 2 }
    ],
    '4.0': [
      { text: 'A+ / A', value: 4.0 },
      { text: 'A-', value: 3.7 },
      { text: 'B+', value: 3.3 },
      { text: 'B', value: 3.0 },
      { text: 'B-', value: 2.7 },
      { text: 'C+', value: 2.3 },
      { text: 'C', value: 2.0 },
      { text: 'C-', value: 1.7 },
      { text: 'D+', value: 1.3 },
      { text: 'D', value: 1.0 },
      { text: 'F', value: 0.0 }
    ],
    '10.0': Array.from({length: 11}, (_, i) => ({ text: `${10 - i}`, value: 10 - i })),
    '100': [
      { text: '90–100%', value: 95 },
      { text: '80–89%', value: 85 },
      { text: '70–79%', value: 75 },
      { text: '60–69%', value: 65 },
      { text: '50–59%', value: 55 },
      { text: '0–49%', value: 30 }
    ]
  };

  function init() {
    updateGradeOptions();
    systemSelect.addEventListener('change', () => {
      currentSystem = systemSelect.value;
      updateGradeOptions();
      resetGradeSelection();
    });
    addBtn.addEventListener('click', addCourse);
    resetBtn.addEventListener('click', () => {
      if (confirm('Clear all subjects?')) {
        courses = [];
        render();
      }
    });
    subjectInput.addEventListener('keypress', e => e.key === 'Enter' && addCourse());
    setTimeout(() => subjectInput.focus(), 600);

    // Event delegation for remove
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.remove-btn');
      if (!btn) return;
      const index = parseInt(btn.dataset.index);
      if (!isNaN(index)) {
        courses.splice(index, 1);
        render();
      }
    });

    // Mobile custom dropdown
    if (gradeDisplay) {
      gradeDisplay.addEventListener('click', toggleDropdown);
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
          closeDropdown();
        }
      });
    }
  }

  function updateGradeOptions() {
    const grades = gradingSystems[currentSystem];

    // PC: Native select
    if (gradeSelectPC) {
      gradeSelectPC.innerHTML = '<option value="" disabled selected>Grade</option>';
      grades.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.value;
        opt.textContent = g.text;
        gradeSelectPC.appendChild(opt);
      });
    }

    // Mobile: Hidden select + custom UI
    if (gradeSelectMobile) {
      gradeSelectMobile.innerHTML = '<option value="" disabled selected>Grade</option>';
      grades.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.value;
        opt.textContent = g.text;
        gradeSelectMobile.appendChild(opt);
      });
    }

    if (gradeOptions) {
      gradeOptions.innerHTML = '';
      grades.forEach(g => {
        const li = document.createElement('li');
        li.textContent = g.text;
        li.dataset.value = g.value;
        li.setAttribute('role', 'option');
        li.tabIndex = 0;
        li.addEventListener('click', () => selectGrade(g.value, g.text));
        li.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectGrade(g.value, g.text);
          }
        });
        gradeOptions.appendChild(li);
      });
    }

    resetGradeSelection();
  }

  function resetGradeSelection() {
    selectedGradeValue = null;
    selectedGradeText = '';
    if (gradeDisplay) gradeDisplay.textContent = 'Grade';
    if (gradeSelectPC) gradeSelectPC.selectedIndex = 0;
    if (gradeSelectMobile) gradeSelectMobile.selectedIndex = 0;
  }

  function toggleDropdown() {
    const isOpen = gradeOptions.style.display === 'block';
    closeDropdown();
    if (!isOpen) {
      gradeOptions.style.display = 'block';
      gradeDisplay.setAttribute('aria-expanded', 'true');
    }
  }

  function closeDropdown() {
    if (gradeOptions) gradeOptions.style.display = 'none';
    if (gradeDisplay) gradeDisplay.setAttribute('aria-expanded', 'false');
  }

  function selectGrade(value, text) {
    selectedGradeValue = parseFloat(value);
    selectedGradeText = text;
    gradeDisplay.textContent = text;
    closeDropdown();

    // Sync hidden select
    if (gradeSelectMobile) {
      const opt = Array.from(gradeSelectMobile.options).find(o => o.value == value);
      if (opt) opt.selected = true;
    }
  }

  function addCourse() {
    const subject = subjectInput.value.trim() || 'Subject';

    // Get grade from PC or Mobile
    let gradeValue, gradeText;
    if (window.innerWidth >= 1024 && gradeSelectPC) {
      gradeValue = parseFloat(gradeSelectPC.value);
      gradeText = gradeSelectPC.options[gradeSelectPC.selectedIndex]?.text || '';
    } else {
      gradeValue = selectedGradeValue;
      gradeText = selectedGradeText;
    }

    if (isNaN(gradeValue)) {
      alert('Please select a grade.');
      return;
    }

    courses.push({ subject, gradeText, gradeValue });
    render();
    subjectInput.value = '';
    resetGradeSelection();
    subjectInput.focus();
  }

  function render() {
    list.innerHTML = '';
    courses.forEach((c, i) => {
      const div = document.createElement('div');
      div.className = 'course-item';
      div.innerHTML = `
        <span>${escapeHtml(c.subject)} — ${escapeHtml(c.gradeText)}</span>
        <button class="remove-btn" data-index="${i}" aria-label="Remove subject">×</button>
      `;
      list.appendChild(div);
    });

    const gpa = courses.length 
      ? (courses.reduce((s, c) => s + c.gradeValue, 0) / courses.length).toFixed(2)
      : '—';
    gpaEl.textContent = gpa;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  init();
  render();
});


const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const closeBtn = document.getElementById('sidebarCloseBtn');

// Open sidebar
hamburgerBtn.addEventListener('click', () => {
  sidebar.classList.add('active');
  overlay.classList.add('active');
});

// Close sidebar
closeBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

function closeSidebar() {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
}
