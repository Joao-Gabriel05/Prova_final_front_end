import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton'
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const [token, setToken] = useState(null)

  const [titulo, setTitulo] = useState()
  const [descricao, setDescricao] = useState()
  const [tempo, setTempo] = useState()

  const [musicas, setMusicas] = useState([])
  const [roles, setRoles] = useState([])

  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently
  } = useAuth0();

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Email:', payload['https://musica-insper.com/email'])
      console.log('Roles:', payload['https://musica-insper.com/roles'])
      setRoles(payload['https://musica-insper.com/roles'])

      fetch('http://localhost:8080/musica', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }).then(response => { 
        return response.json()
      }).then(data => { 
        setMusicas(data)
      }).catch(error => {
        alert(error)
      })
    }

  }, [token])

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken);
      } catch (e) {
        console.error('Erro ao buscar token:', e);
      }
    };

    if (isAuthenticated) {
      fetchToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  function salvarMusica() {

    fetch('http://localhost:8080/musica', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        'titulo': titulo,
        'descricao': descricao,
        'tempo': tempo
      })
    }).then(response => { 
      return response.json()
    }).catch(error => {
      alert(error)
    })

  }

  function excluir(id) {

    fetch('http://localhost:8080/musica/' + id, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(response => { 
      return response.json()
    }).catch(error => {
      alert(error)
    })

  }

  return (
    <>
      <div>
        <div>
          <img src={user.picture} alt={user.name} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <LogoutButton />
        </div>

       {roles.includes('ADMIN') && <div>
          Título: <input type='text' onChange={e => setTitulo(e.target.value)} /><br/>
          Descrição: <input type='text' onChange={e => setDescricao(e.target.value)} /><br/>
          Tempo: <input type='text' onChange={e => setTempo(e.target.value)} /><br/>
          <button onClick={() => salvarMusica()}>Cadastrar</button>
        </div>
        }


        <div>
          <table>
            <thead>
              <th>Título</th>
              <th>Descrição</th>
              <th>Tempo</th>
              <th>Usuário</th>
              {roles.includes('ADMIN') && <th>Excluir</th> }

            </thead>
            <tbody>
                {musicas.map((musica, index) => {
                return <tr key={index}>
                      <td>{musica.titulo}</td>
                      <td>{musica.descricao}</td>
                      <td>{musica.tempo}</td>
                      <td>{musica.email}</td>
                      {roles.includes('ADMIN') && <td><button onClick={() => excluir(musica.id)}>Excluir</button></td> }
                    </tr>
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default App;
