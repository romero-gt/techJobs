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

function mostrarCandidatos(listaDeCandidatos) {
  const container = document.getElementById('candidates')
  container.innerHTML = listaDeCandidatos.map( user => 
  `
    <div class="col-md-4 mb-3">
      <div class="card border-primary shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${user.name}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${user.email}</h6>
          <div class="mt-3">
            <button class="btn btn-sm btn-warning me-2" onclick="abrirModalUsuario('${user.id}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="excluirUsuario('${user.id}')">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  `).join('')
}



let candidatosVisiveis = false;

function alternarCandidatos() {
  const container = document.getElementById('candidates')
  candidatosVisiveis = !candidatosVisiveis; //toggle (liga/desliga)
  container.style.display = candidatosVisiveis ? 'flex' : 'none';
  if (candidatosVisiveis) carregarCandidatos();
}
window.toggleCandidates = alternarCandidatos;

function abrirModalUsuario(id) {

  const exibirFormulario = (nome = '', email = '') => {
    Swal.fire({
      title: 'Editar',
      showCancelButton: true,
      html: 
      `
      <input id="swal-nome" class="swa12-input" type="name" value="${nome}"> <br>
      <input id="swal-email" class="swa12-input" type="email" value="${email}">
      `,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar.',
      focusConfirm: false,
      preConfirm: () => {
        const nome = document.getElementById('swal-nome').value.trim();
        const email = document.getElementById('swal-email').value.trim();
        if(!nome || !email) {
          Swal.showValidationMessage('Preencha todos os campos');
          return false;
        }
        return {name: nome, email: email};
      }
    })
    .then(result => {
      if(!result.isConfirmed) return;
      Swal.fire('Sucesso', `Candidato ${id} atualizado!`, `success`)
      .then(() => {
        const url = `http://localhost:3000/users/${id}`;
        if (result.isConfirmed) {
          axios.put(url, result.value)
            .then(() => {
              carregarCandidatos();
            })
            .catch(() => {
              mostrarErro('Não foi possível salvar.');
            });
        }
      })
      
        .catch(() => {
          mostrarErro('Não foi possível salvar.')
        })
    })
  }
  Swal.fire({
    title: 'Deseja modificar o usuário?',
    showCancelButton: true,
    confirmButtonText: 'Sim.',
    cancelButtonText: 'Não.'
  }).then(result => {
    if(!result.isConfirmed) return;
    axios.get(`http://localhost:3000/users/${id}`)
        .then(res => exibirFormulario(res.data.name, res.data.email))
        .catch(() => mostrarErro('Usuário não foi encontrado!'))
  })
}

function createUser(id) {
}

function excluirUsuario(id) {
  Swal.fire({
    title: 'Tem certeza?',
    text: 'Essa ação não poderá ser desfeita!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim.',
    cancelButtonText: 'Cancelar.' 
  }).then(result => {
    if(!result.isConfirmed) return;
    axios.delete(`http://localhost:3000/users/${id}`)
      .then(() => {
        Swal.fire({
          title: 'Excluido!',
          text: 'Cadastro excluido com sucesso.',
          confirmButtonText: 'Ok!'
        });
      })
      .catch(() => mostrarErro('Não foi possível excluir!'));
  })
}

function mostrarErro(msg) {
    Swal.fire('Erro', msg, 'error');
}

