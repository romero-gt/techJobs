window.onload = () => {
  carregarVagas();
}

async function carregarVagas () {
  try {
      const { data: vagas } = await axios.get('http://localhost:3000/jobs');
      mostrarVagas(vagas);
  } catch (error) {
      mostrarErro('Erro ao carregar vagas!')
  }
}

function mostrarVagas(vagas) {
  const container = document.getElementById('job-list');
  container.innerHTML = vagas.map(vaga => 
      `
  <div class="col-md-4 mb-4">
    <div class="card border-info shadow-sm">
      <div class="card-body">
        <h5 class="card-title">${vaga.title}</h5>
        <p class="card-text"><strong>Empresa:</strong> ${vaga.company}</p>
        <p class="card-text">
          <span class="badge rounded-pill bg-info text-muted">
            ${vaga.location || 'Não informado'}
          </span>
        </p>
      </div>
    </div>
  </div>
      `
  ).join('');
}

function carregarCandidatos() {
  axios.get('http://localhost:3000/users')
      .then(res => mostrarCandidatos(res.data))
      .catch(() => mostrarErro('Erro ao buscar candidatos'));
}

function mostrarErro(msg) {
  Swal.fire('Erro', msg, 'error')
}