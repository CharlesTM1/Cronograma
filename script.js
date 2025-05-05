document.addEventListener('DOMContentLoaded', function() {
    const formTarefa = document.getElementById('form-tarefa');
    const tabelaCronograma = document.getElementById('tabela-cronograma');
    const cronogramaData = {}; // Objeto para armazenar as tarefas do cronograma

    // Inicializa o cronograma com horários (opcional)
    const horarios = gerarHorarios(8, 18); // Das 8h às 18h
    horarios.forEach(hora => {
        const linha = tabelaCronograma.insertRow();
        const celulaHorario = linha.insertCell();
        celulaHorario.textContent = hora;
        for (let i = 0; i < 7; i++) {
            linha.insertCell();
        }
    });

    formTarefa.addEventListener('submit', function(event) {
        event.preventDefault();

        const materia = document.getElementById('materia').value;
        const dia = document.getElementById('dia').value;
        const horaInicio = document.getElementById('hora-inicio').value;
        const horaFim = document.getElementById('hora-fim').value;

        adicionarTarefaAoCronograma(materia, dia, horaInicio, horaFim);
        formTarefa.reset();
    });

    function adicionarTarefaAoCronograma(materia, dia, horaInicio, horaFim) {
        const indiceDia = obterIndiceDia(dia);
        const linhas = tabelaCronograma.rows;

        const inicio = parseInt(horaInicio.split(':')[0]);
        const fim = parseInt(horaFim.split(':')[0]);

        for (let i = 1; i < linhas.length; i++) { // Começa da segunda linha (após o cabeçalho de horários)
            const horarioLinha = parseInt(linhas[i].cells[0].textContent.split(':')[0]);

            if (horarioLinha >= inicio && horarioLinha < fim) {
                const celulaDia = linhas[i].cells[indiceDia + 1]; // +1 porque a primeira célula é o horário
                const tarefaDiv = document.createElement('div');
                tarefaDiv.classList.add('tarefa');
                tarefaDiv.textContent = materia;
                tarefaDiv.title = `Das ${horaInicio} às ${horaFim}`; // Adiciona um tooltip
                celulaDia.appendChild(tarefaDiv);
            } else if (horarioLinha === inicio) {
                // Se a tarefa começa exatamente nessa hora, também adiciona
                const celulaDia = linhas[i].cells[indiceDia + 1];
                const tarefaDiv = document.createElement('div');
                tarefaDiv.classList.add('tarefa');
                tarefaDiv.textContent = materia;
                tarefaDiv.title = `Das ${horaInicio} às ${horaFim}`;
                celulaDia.appendChild(tarefaDiv);
            }
        }

        // (Opcional) Salvar os dados localmente
        salvarCronogramaLocalmente();
    }

    function obterIndiceDia(dia) {
        const dias = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
        return dias.indexOf(dia);
    }

    function gerarHorarios(inicio, fim) {
        const horas = [];
        for (let i = inicio; i <= fim; i++) {
            horas.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return horas;
    }

    function salvarCronogramaLocalmente() {
        // Converte a tabela para um formato de dados que pode ser salvo
        const tarefasSalvar = [];
        const linhas = tabelaCronograma.rows;
        for (let i = 1; i < linhas.length; i++) {
            const horario = linhas[i].cells[0].textContent;
            for (let j = 1; j < linhas[i].cells.length; j++) {
                const diaIndice = j - 1;
                const diaSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"][diaIndice];
                const tarefasNaCelula = linhas[i].cells[j].querySelectorAll('.tarefa');
                tarefasNaCelula.forEach(tarefaDiv => {
                    const [inicio, fim] = tarefaDiv.title.replace('Das ', '').split(' às ');
                    tarefasSalvar.push({ materia: tarefaDiv.textContent, dia: diaSemana, horaInicio: inicio, horaFim: fim });
                });
            }
        }
        localStorage.setItem('cronograma', JSON.stringify(tarefasSalvar));
    }

    function carregarCronogramaLocalmente() {
        const cronogramaSalvo = localStorage.getItem('cronograma');
        if (cronogramaSalvo) {
            const tarefasCarregadas = JSON.parse(cronogramaSalvo);
            tarefasCarregadas.forEach(tarefa => {
                adicionarTarefaAoCronograma(tarefa.materia, tarefa.dia, tarefa.horaInicio, tarefa.horaFim);
            });
        }
    }

    // Carregar o cronograma ao carregar a página
    carregarCronogramaLocalmente();
});
