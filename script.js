document.addEventListener('DOMContentLoaded', function() {
    const componentsContainer = document.getElementById('components-container');
    const addComponentBtn = document.getElementById('add-component-btn');
    const gradeForm = document.getElementById('grade-form');
    const resultDiv = document.getElementById('result');

    const createComponentRow = (name = '', weight = '', score = '', isFinal = false) => {
        const row = document.createElement('div');
        row.className = 'grid grid-cols-12 gap-2 md:gap-4 items-center component-row p-1.5 hover:bg-slate-50 rounded-lg';
        
        row.innerHTML = `
            <div class="col-span-5">
                <input type="text" class="form-input w-full bg-slate-100 border-transparent rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500" placeholder="VD: Chuyên cần" value="${name}">
            </div>
            <div class="col-span-2">
                <input type="number" class="form-input component-weight w-full bg-slate-100 border-transparent rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500" placeholder="%" min="0" max="100" step="1" value="${weight}">
            </div>
            <div class="col-span-2">
                <input type="number" class="form-input component-score w-full bg-slate-100 border-transparent rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500" placeholder="Điểm" min="0" max="10" step="0.1" value="${score}">
            </div>
            <div class="col-span-2 flex justify-center">
                <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 component-final" ${isFinal ? 'checked' : ''}>
            </div>
            <div class="col-span-1 flex justify-center">
                <button type="button" class="remove-btn text-slate-400 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                        </button>
                    </div>
                `;
        componentsContainer.appendChild(row);
    };


    createComponentRow('Bài Tập Về Nhà', 5, '', false);
    createComponentRow('Chuyên Cần', 5, '', false);
    createComponentRow('Kiểm Tra Giữa Kỳ', 15, '', false);
    createComponentRow('Phát Biểu & Thảo Luận', 5, '', false);
    createComponentRow('Thực Hành & Thực Tế', 15, '', false);
    createComponentRow('Kiểm Tra Cuối Kỳ', 55, '', true);


    addComponentBtn.addEventListener('click', () => createComponentRow());

    componentsContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-btn')) {
            e.target.closest('.component-row').remove();
        }
    });

    componentsContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('component-final')) {
            if (e.target.checked) {
                document.querySelectorAll('.component-final').forEach(checkbox => {
                    if (checkbox !== e.target) {
                        checkbox.checked = false;
                    }
                });
            }
        }
    });

    gradeForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let totalWeightedScore = 0;
        let totalWeight = 0;
        let finalExamScore = null;
        let hasInput = false;

        const rows = componentsContainer.querySelectorAll('.component-row');
        rows.forEach(row => {
            const weightInput = row.querySelector('.component-weight');
            const scoreInput = row.querySelector('.component-score');
            
            const weight = parseFloat(weightInput.value);
            const score = parseFloat(scoreInput.value);

            if (!isNaN(weight) && !isNaN(score) && weight > 0) {
                hasInput = true;
                totalWeight += weight;
                totalWeightedScore += score * (weight / 100);
                
                if (row.querySelector('.component-final').checked) {
                    finalExamScore = score;
                }
            }
        });
        
        if (!hasInput) {
            alert('Vui lòng nhập ít nhất một cột điểm có trọng số và điểm số hợp lệ.');
            return;
        }

        const finalScore = parseFloat(totalWeightedScore.toFixed(2));
        let letterGrade, classification, status, statusClass, score4, note = '';
        let isFailed = false;

        const noteEl = document.getElementById('note');
        if (totalWeight !== 100) {
            note = `Lưu ý: Tổng trọng số hiện tại là ${totalWeight}%, không phải 100%.`;
            noteEl.className = 'text-center font-medium mt-4 text-sm text-orange-600';
        } else {
            note = '';
            noteEl.className = 'text-center font-medium mt-4 text-sm';
        }

        if (finalExamScore !== null && finalExamScore < 1.0) {
            isFailed = true;
            note += (note ? '<br>' : '') + 'Nợ môn do điểm thi kết thúc học phần dưới 1.0';
        } else if (finalScore < 4.0) {
            isFailed = true;
            note += (note ? '<br>' : '') + 'Nợ môn do điểm tổng kết học phần dưới 4.0';
        }
        
        if (isFailed) {
             noteEl.classList.add('text-red-600');
        }

        if (finalScore >= 9.5) { letterGrade = 'A+'; score4 = 4.0; classification = 'Giỏi'; } 
        else if (finalScore >= 8.5) { letterGrade = 'A'; score4 = 4.0; classification = 'Giỏi'; } 
        else if (finalScore >= 8.0) { letterGrade = 'A-'; score4 = 3.65; classification = 'Giỏi'; } 
        else if (finalScore >= 7.5) { letterGrade = 'B+'; score4 = 3.33; classification = 'Khá'; } 
        else if (finalScore >= 7.0) { letterGrade = 'B'; score4 = 3.0; classification = 'Khá'; } 
        else if (finalScore >= 6.5) { letterGrade = 'B-'; score4 = 2.65; classification = 'Khá'; } 
        else if (finalScore >= 6.0) { letterGrade = 'C+'; score4 = 2.33; classification = 'Trung bình'; } 
        else if (finalScore >= 5.5) { letterGrade = 'C'; score4 = 2.0; classification = 'Trung bình'; } 
        else if (finalScore >= 4.5) { letterGrade = 'C-'; score4 = 1.65; classification = 'Trung bình yếu'; } 
        else if (finalScore >= 4.0) { letterGrade = 'D'; score4 = 1.0; classification = 'Trung bình yếu'; } 
        else { letterGrade = 'F'; score4 = 0.0; classification = 'Kém'; }
        
        if (isFailed) {
            letterGrade = 'F';
            score4 = 0.0;
            classification = 'Kém';
            status = 'Nợ môn';
            statusClass = 'bg-red-100 text-red-700';
        } else {
            status = 'Qua môn';
            statusClass = 'bg-green-100 text-green-700';
        }

        document.getElementById('total-weight').textContent = `${totalWeight}%`;
        document.getElementById('final-score').textContent = finalScore.toFixed(2);
        document.getElementById('score-4').textContent = score4.toFixed(2);
        document.getElementById('letter-grade').textContent = letterGrade;
        document.getElementById('classification').textContent = classification;
        
        const statusEl = document.getElementById('status');
        statusEl.textContent = status;
        statusEl.className = `font-bold text-xl px-4 py-1.5 rounded-full ${statusClass}`;
        
        noteEl.innerHTML = note;

        resultDiv.classList.remove('hidden');
    });
});
