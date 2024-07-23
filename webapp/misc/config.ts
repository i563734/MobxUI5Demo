export async function apiGet<T>(queryString:string) {
    return  <T> await fetch(`https://api.tvmaze.com/${queryString}`).then(r =>
      r.json()
    );
  }