document.addEventListener('DOMContentLoaded', function() {
    // Dark Mode
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        lightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        darkIcon.classList.remove('hidden');
    }

    themeToggleBtn.addEventListener('click', function() {
        darkIcon.classList.toggle('hidden');
        lightIcon.classList.toggle('hidden');
        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }
        } else {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }
    });

    // DOM Elements
    const componentsContainer = document.getElementById('components-container');
    const addComponentBtn = document.getElementById('add-component-btn');
    const gradeForm = document.getElementById('grade-form');
    const resultDiv = document.getElementById('result');
    const currentTotalWeightEl = document.getElementById('current-total-weight');
    const predictBtn = document.getElementById('predict-btn');
    const predictionResultDiv = document.getElementById('prediction-result');
    const predictionText = document.getElementById('prediction-text');
    const predictionList = document.getElementById('prediction-list');

    const updateTotalWeight = () => {
        let totalWeight = 0;
        componentsContainer.querySelectorAll('.component-row').forEach(row => {
            const weight = parseFloat(row.querySelector('.component-weight').value);
            if (!isNaN(weight) && weight > 0) totalWeight += weight;
        });
        currentTotalWeightEl.textContent = `${totalWeight}%`;
        currentTotalWeightEl.className = 'font-bold text-lg transition-colors ' + 
            (totalWeight > 100 ? 'text-red-600 dark:text-red-400' : 
             totalWeight === 100 ? 'text-green-600 dark:text-green-400' : 
             'text-blue-600 dark:text-blue-400');
    };

    const createComponentRow = (name = '', weight = '', score = '', isFinal = false) => {
        const row = document.createElement('div');
        row.className = 'grid grid-cols-12 gap-2 md:gap-4 items-center component-row p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors';
        row.innerHTML = `
            <div class="col-span-5"><input type="text" class="form-input w-full bg-slate-100 dark:bg-slate-700 dark:text-white border-transparent rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-colors" placeholder="VD: Chuyên cần" value="${name}"></div>
            <div class="col-span-2"><input type="number" class="form-input component-weight w-full bg-slate-100 dark:bg-slate-700 dark:text-white border-transparent rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-colors" placeholder="%" min="0" max="100" value="${weight}"></div>
            <div class="col-span-2"><input type="number" class="form-input component-score w-full bg-slate-100 dark:bg-slate-700 dark:text-white border-transparent rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-colors" placeholder="Điểm" min="0" max="10" step="0.1" value="${score}"></div>
            <div class="col-span-2 flex justify-center"><input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600 rounded-sm border-slate-300 dark:border-slate-500 dark:bg-slate-700 focus:ring-blue-500 component-final" ${isFinal ? 'checked' : ''}></div>
            <div class="col-span-1 flex justify-center"><button type="button" class="remove-btn text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></button></div>
        `;
        componentsContainer.appendChild(row);
    };

    // Init rows
    createComponentRow('Bài Tập Về Nhà', 5);
    createComponentRow('Chuyên Cần', 5);
    createComponentRow('Kiểm Tra Giữa Kỳ', 15);
    createComponentRow('Phát Biểu & Thảo Luận', 5);
    createComponentRow('Thực Hành & Thực Tế', 15);
    createComponentRow('Kiểm Tra Cuối Kỳ', 55, '', true);
    updateTotalWeight();

    addComponentBtn.addEventListener('click', () => { createComponentRow(); updateTotalWeight(); });
    componentsContainer.addEventListener('click', e => { if(e.target.closest('.remove-btn')) { e.target.closest('.component-row').remove(); updateTotalWeight(); } });
    componentsContainer.addEventListener('change', e => { 
        if(e.target.classList.contains('component-final') && e.target.checked) 
            document.querySelectorAll('.component-final').forEach(c => { if(c !== e.target) c.checked = false; });
    });
    componentsContainer.addEventListener('input', e => {
        if(e.target.classList.contains('component-score') && parseFloat(e.target.value) > 10) e.target.value = '';
        if(e.target.classList.contains('component-weight')) updateTotalWeight();
        predictionResultDiv.classList.add('hidden');
    });

    // Prediction Logic
    predictBtn.addEventListener('click', () => {
        resultDiv.classList.add('hidden');
        let currentWeighted = 0, finalWeight = 0, otherWeights = 0, hasFinal = false, isValid = true;

        componentsContainer.querySelectorAll('.component-row').forEach(row => {
            const w = parseFloat(row.querySelector('.component-weight').value);
            const s = parseFloat(row.querySelector('.component-score').value);
            if(row.querySelector('.component-final').checked) {
                hasFinal = true; finalWeight = w;
                if(isNaN(w) || w <= 0) isValid = false;
            } else if(!isNaN(w) && w > 0) {
                otherWeights += w;
                if(!isNaN(s)) currentWeighted += s * (w/100);
                else isValid = false;
            }
        });

        if(!isValid || !hasFinal || (otherWeights + finalWeight !== 100)) return alert('Vui lòng kiểm tra lại trọng số và điểm thành phần.');

        const targets = [
            { g: 'D (4.0) - Qua môn', t: 4.0 }, { g: 'C (5.5)', t: 5.5 }, 
            { g: 'B (7.0)', t: 7.0 }, { g: 'A (8.5)', t: 8.5 }, { g: 'A+ (9.5)', t: 9.5 }
        ];

        let html = '';
        targets.forEach(item => {
            let need = Math.ceil(((item.t - currentWeighted) / (finalWeight/100)) * 100) / 100;
            if (item.t === 4.0 && need < 1.0) need = 1.0;
            let display = need > 10 ? 'Không thể đạt' : need <= 0 ? '>= 1.0' : `${need} điểm`;
            let color = need > 10 ? 'text-gray-400' : need <= 0 ? 'text-green-600' : need > 8 ? 'text-red-600' : need > 5 ? 'text-orange-600' : 'text-blue-600';
            html += `<li class="flex justify-between border-b dark:border-yellow-700 py-1"><span>Để đạt <strong>${item.g}</strong>:</span><span class="${color} font-bold">${display}</span></li>`;
        });

        predictionText.innerHTML = `Điểm thành phần: <strong>${currentWeighted.toFixed(2)}</strong>. Điểm cuối kỳ (${finalWeight}%) cần:`;
        predictionList.innerHTML = html;
        predictionResultDiv.classList.remove('hidden');
    });

    // Calculation Logic
    gradeForm.addEventListener('submit', e => {
        e.preventDefault();
        predictionResultDiv.classList.add('hidden');
        let totalW = 0, totalS = 0, finalS = null, hasInput = false;

        componentsContainer.querySelectorAll('.component-row').forEach(row => {
            const w = parseFloat(row.querySelector('.component-weight').value);
            const s = parseFloat(row.querySelector('.component-score').value);
            if(!isNaN(w) && !isNaN(s) && w > 0) {
                hasInput = true; totalW += w; totalS += s * (w/100);
                if(row.querySelector('.component-final').checked) finalS = s;
            }
        });

        if(!hasInput || totalW > 100) return alert('Dữ liệu không hợp lệ.');

        const final = parseFloat(totalS.toFixed(2));
        let grade, s4, cls, status, stClass, note = totalW < 100 ? `Tổng trọng số: ${totalW}% (chưa đủ 100%)` : '';
        let failed = (finalS !== null && finalS < 1.0) || final < 4.0;
        
        if (final >= 9.5) { grade='A+'; s4=4.0; cls='Giỏi'; } 
        else if (final >= 8.5) { grade='A'; s4=4.0; cls='Giỏi'; }
        else if (final >= 8.0) { grade='A-'; s4=3.65; cls='Giỏi'; }
        else if (final >= 7.5) { grade='B+'; s4=3.33; cls='Khá'; }
        else if (final >= 7.0) { grade='B'; s4=3.0; cls='Khá'; }
        else if (final >= 6.5) { grade='B-'; s4=2.65; cls='Khá'; }
        else if (final >= 6.0) { grade='C+'; s4=2.33; cls='TB'; }
        else if (final >= 5.5) { grade='C'; s4=2.0; cls='TB'; }
        else if (final >= 4.5) { grade='C-'; s4=1.65; cls='TB Yếu'; }
        else if (final >= 4.0) { grade='D'; s4=1.0; cls='TB Yếu'; }
        else { grade='F'; s4=0.0; cls='Kém'; }

        if(failed) { grade='F'; s4=0.0; cls='Kém'; status='Nợ môn'; stClass='bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200'; }
        else { status='Qua môn'; stClass='bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200'; }

        document.getElementById('total-weight').textContent = `${totalW}%`;
        document.getElementById('final-score').textContent = final.toFixed(2);
        document.getElementById('score-4').textContent = s4.toFixed(2);
        document.getElementById('letter-grade').textContent = grade;
        document.getElementById('classification').textContent = cls;
        const stEl = document.getElementById('status');
        stEl.textContent = status; stEl.className = `font-bold text-xl px-4 py-1.5 rounded-full ${stClass}`;
        const nEl = document.getElementById('note');
        nEl.innerHTML = note + (failed ? (note ? '<br>' : '') + 'Cảnh báo: Nợ môn.' : '');
        nEl.className = `text-center font-medium mt-4 text-sm ${failed ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`;
        
        resultDiv.classList.remove('hidden');
    });
});