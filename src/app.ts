var apiKey = '40e985bc6b11b2876bcbec95ef6b72e2';
let requestToken : string;
let username : string;
let password: string;
let sessionId: string; 
let listId = '7101979';

let loginButton = document.getElementById('login-button') as HTMLButtonElement;
let searchButton = document.getElementById('search-button') as HTMLButtonElement;
let searchContainer = document.getElementById('search-container');


if(loginButton){
    loginButton.addEventListener('click', async () => {
        await criarRequestToken();
        await logar();
        await criarSessao();
      })
}

searchButton.addEventListener('click', async () => {
  let lista = document.getElementById("lista");
  if (lista) {
    lista.outerHTML = "";
  }
  let query = (<HTMLInputElement> document.getElementById('search')).value;
  let listaDeFilmes = await procurarFilme(query);
  let ul = document.createElement('ul');
  ul.id = "lista"
  for (const item of listaDeFilmes.results) {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(item.original_title))
    ul.appendChild(li)
  }
  console.log(listaDeFilmes);
  if(searchContainer){
    searchContainer.appendChild(ul);
  }
  
})
      


function preencherSenha() {
  let inputSenha = document.getElementById('senha') as HTMLInputElement;
  password = inputSenha.value;
  validateLoginButton();
}

function preencherLogin() {
  let inputLogin = document.getElementById('login') as HTMLInputElement;
  username = inputLogin.value;
  validateLoginButton();
}

function preencherApi() {
  let inputApiKey = document.getElementById('api-key') as HTMLInputElement;
  apiKey = inputApiKey.value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

class HttpClient {
  static async get({url, method, body = null}) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(body);
      }
      request.send(body);
    })
  }
}

async function procurarFilme(query) {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET"
  })
  return result
}
// tipei filmeId p/ number
async function adicionarFilme(filmeId: number) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}

async function criarRequestToken () {
  // coloquei any em result
  let result: any = await HttpClient.get({ 
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  })  
    requestToken = result.request_token;
  
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
}

async function criarSessao() {
  // coloquei any em result
  let result: any = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  })
  sessionId = result.session_id;
}

async function criarLista(nomeDaLista: string, descricao: string) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    }
  })
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId: number, listaId: number) {
  let result =  await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      media_id: filmeId
    }
  })
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET"
  })
  console.log(result);
}

interface IResultToken{
  sucess: boolean;
  expires_at: string;
  request_token: string;
}

interface IRequestBodyWithLogin{
  success: boolean;
  expires_at: string;
  request_token: string;
}

interface IResult {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection:null;
  budget: number;
  genres:IGenres;
  homepage: string;
  id: number;
  imdb_id: string;
  original_language: string;
  original_title:string;
  overview: string;
  popularity: number;
  poster_path:string;
  production_companies: IProduction_companies;
  production_countries:IProduction_countries;
  release_date:string;
  revenue:number;
  runtime: number;
  spoken_languages: ISpoken_languages;
  status:string;
  tagline: string;
  title: string;
  video:false,
  vote_average:number;
  vote_count:number;
}

interface IGenres{
  id:number;
  name: string;
}

interface IProduction_companies{
  id: number;
  logo_path:string;
  name: string;
  origin_country:string;

}

interface IProduction_countries{
  iso_3166_1: string;
  name: string;
}

interface ISpoken_languages{
  english_name: string;
  iso_639_1: string;
  name: string;
}
