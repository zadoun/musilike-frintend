let spotifyToken = null;
let tokenExpires = 0;

async function getSpotifyToken() {
  const fetch = (await import('node-fetch')).default;
  if (spotifyToken && Date.now() < tokenExpires) {
    return spotifyToken;
  }
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  spotifyToken = data.access_token;
  tokenExpires = Date.now() + (data.expires_in - 60) * 1000;
  return spotifyToken;
}

async function searchSpotifyTracks(query) {
  const fetch = (await import('node-fetch')).default;
  const token = await getSpotifyToken();
  const res = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}&limit=10`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.tracks ? data.tracks.items : [];
}

async function getPopularArtistsByGenre(genre) {
  const fetch = (await import('node-fetch')).default;
  const token = await getSpotifyToken();
  const url = `https://api.spotify.com/v1/search?type=artist&q=genre:%22${encodeURIComponent(genre)}%22&limit=10`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!data.artists || !Array.isArray(data.artists.items)) return [];
  return data.artists.items.map(artist => ({
    name: artist.name,
    id: artist.id,
    images: artist.images,
    spotifyUrl: artist.external_urls && artist.external_urls.spotify
  }));
}

// --- Liste statique d'artistes (exemple, à compléter)
const STATIC_ARTISTS = [
  {
    "id": "3fMbdgg4jU18AjLCKBhRSm",
    "genre": "pop",
    "name": "Michael Jackson",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb997cc9a4aec335d46c9481fd",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174997cc9a4aec335d46c9481fd",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178997cc9a4aec335d46c9481fd",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6tbjWDEIzxoDsBA1FuhfPW",
    "genre": "pop",
    "name": "Madonna",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb6ccc1215f5b205aa6b34b48b",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051746ccc1215f5b205aa6b34b48b",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1786ccc1215f5b205aa6b34b48b",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5a2EaR3hamoenG9rDuVn8j",
    "genre": "pop",
    "name": "Prince",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebeaca358712b3fe4ed9814640",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174eaca358712b3fe4ed9814640",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178eaca358712b3fe4ed9814640",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6vWDO969PvNqNYHIOW5v0m",
    "genre": "pop",
    "name": "Beyoncé",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb7eaa373538359164b843f7c0",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051747eaa373538359164b843f7c0",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1787eaa373538359164b843f7c0",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "43ZHCT0cAZBISjO8DG9PnE",
    "genre": "pop",
    "name": "Elvis Presley",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb9a93e273380982dff84c0d7c",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051749a93e273380982dff84c0d7c",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1789a93e273380982dff84c0d7c",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "26dSoYclwsYLMAKD3tpOr4",
    "genre": "pop",
    "name": "Britney Spears",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb26e59b825251b7df20a7b65e",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517426e59b825251b7df20a7b65e",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17826e59b825251b7df20a7b65e",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3PhoLpVuITZKcymswpck5b",
    "genre": "pop",
    "name": "Elton John",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb0dc33a1c53bb58a84b45d6a7",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051740dc33a1c53bb58a84b45d6a7",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1780dc33a1c53bb58a84b45d6a7",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "06HL4z0CvFAxyc27GXpf02",
    "genre": "pop",
    "name": "Taylor Swift",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe672b5f553298dcdccb0e676",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e672b5f553298dcdccb0e676",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e672b5f553298dcdccb0e676",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6XpaIBNiVzIetEPCWDvAFP",
    "genre": "pop",
    "name": "Whitney Houston",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebcd9f60ab57585bf3b77ecc51",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174cd9f60ab57585bf3b77ecc51",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178cd9f60ab57585bf3b77ecc51",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1HY2Jd0NmPuamShAr6KMms",
    "genre": "pop",
    "name": "Lady Gaga",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebaadc18cac8d48124357c38e6",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174aadc18cac8d48124357c38e6",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178aadc18cac8d48124357c38e6",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3WrFJ7ztbogyGnTHbHJFl2",
    "genre": "rock",
    "name": "The Beatles",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe9348cc01ff5d55971b22433",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e9348cc01ff5d55971b22433",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e9348cc01ff5d55971b22433",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "22bE4uQ6baNwSHPVcDxLCe",
    "genre": "rock",
    "name": "The Rolling Stones",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe4cea917b68726aadb4854b8",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e4cea917b68726aadb4854b8",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e4cea917b68726aadb4854b8",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "36QJpDe2go2KgaRleHCDTp",
    "genre": "rock",
    "name": "Led Zeppelin",
    "images": [
      {
        "url": "https://i.scdn.co/image/207803ce008388d3427a685254f9de6a8f61dc2e",
        "height": 600,
        "width": 600
      },
      {
        "url": "https://i.scdn.co/image/b0248a44865493e6a03832aa89854ada16ff07a8",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/16eb3cdae0d824b520ac17710e943a99d3ef6602",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "0k17h0D3J5VfsdmQ1iZtE9",
    "genre": "rock",
    "name": "Pink Floyd",
    "images": [
      {
        "url": "https://i.scdn.co/image/e69f71e2be4b67b82af90fb8e9d805715e0684fa",
        "height": 977,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/d011c95081cd9a329e506abd7ded47535d524a07",
        "height": 625,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/f0a39a8a196a87a7236bdcf8a8708f6d5d3547cc",
        "height": 195,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/ec1fb7127168dbaa962404031409c5a293b95ec6",
        "height": 63,
        "width": 64
      }
    ]
  },
  {
    "id": "1dfeR4HaWDbWqFHLkxsg1d",
    "genre": "rock",
    "name": "Queen",
    "images": [
      {
        "url": "https://i.scdn.co/image/b040846ceba13c3e9c125d68389491094e7f2982",
        "height": 806,
        "width": 999
      },
      {
        "url": "https://i.scdn.co/image/af2b8e57f6d7b5d43a616bd1e27ba552cd8bfd42",
        "height": 516,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/c06971e9ff81696699b829484e3be165f4e64368",
        "height": 161,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/6dd0ffd270903d1884edf9058c49f58b03db893d",
        "height": 52,
        "width": 64
      }
    ]
  },
  {
    "id": "776Uo845nYHJpNaStv1Ds4",
    "genre": "rock",
    "name": "Jimi Hendrix",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb31f6ab67e6025de876475814",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517431f6ab67e6025de876475814",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17831f6ab67e6025de876475814",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6olE6TJLqED3rqDCT0FyPh",
    "genre": "rock",
    "name": "Nirvana",
    "images": [
      {
        "url": "https://i.scdn.co/image/84282c28d851a700132356381fcfbadc67ff498b",
        "height": 1057,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/a4e10b79a642e9891383448cbf37d7266a6883d6",
        "height": 677,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/42ae0f180f16e2f21c1f2212717fc436f5b95451",
        "height": 211,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/e797ad36d56c3fc8fa06c6fe91263a15bf8391b8",
        "height": 68,
        "width": 64
      }
    ]
  },
  {
    "id": "711MCceyCBcFnzjGY4Q7Un",
    "genre": "rock",
    "name": "AC/DC",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebc4c77549095c86acb4e77b37",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174c4c77549095c86acb4e77b37",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178c4c77549095c86acb4e77b37",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0oSGxfWSnnOXhD2fKuz2Gy",
    "genre": "rock",
    "name": "David Bowie",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebb78f77c5583ae99472dd4a49",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174b78f77c5583ae99472dd4a49",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178b78f77c5583ae99472dd4a49",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "51Blml2LZPmy7TTiAg47vQ",
    "genre": "rock",
    "name": "U2",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe62be215d2ee31bcd97edaba",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e62be215d2ee31bcd97edaba",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e62be215d2ee31bcd97edaba",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0WwSkZ7LtFUFjGjMZBMt6T",
    "genre": "rock",
    "name": "Dire Straits",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb4bdaa8c5e65b64f50549c393",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051744bdaa8c5e65b64f50549c393",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1784bdaa8c5e65b64f50549c393",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1ZwdS5xdxEREPySFridCfh",
    "genre": "hip hop",
    "name": "Tupac Shakur",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb7f5cc432c9c109248ebec1ac",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051747f5cc432c9c109248ebec1ac",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1787f5cc432c9c109248ebec1ac",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5me0Irg2ANcsgc93uaYrpb",
    "genre": "hip hop",
    "name": "The Notorious B.I.G.",
    "images": [
      {
        "url": "https://i.scdn.co/image/1b4858fbd24046a81cace5ee18d19c868262b91f",
        "height": 1250,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/9bb42de208edcb69653a8e7951fa93b13f598cdd",
        "height": 800,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/e56612ae56c9007e99ab36b83efd4faf6401260d",
        "height": 250,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/fc074d287739cca12a89c76fd338ff7d4aa4acee",
        "height": 80,
        "width": 64
      }
    ]
  },
  {
    "id": "3nFkdlSjzX9mRTtwJOzDYB",
    "genre": "hip hop",
    "name": "Jay-Z",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebc75afcd5a9027f60eaebb5e4",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174c75afcd5a9027f60eaebb5e4",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178c75afcd5a9027f60eaebb5e4",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "20qISvAhX20dpIbOOzGK3q",
    "genre": "hip hop",
    "name": "Nas",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb153198caeef9e3bda92f9285",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174153198caeef9e3bda92f9285",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178153198caeef9e3bda92f9285",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7dGJo4pcD2V6oG8kP0tJRR",
    "genre": "hip hop",
    "name": "Eminem",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eba00b11c129b27a88fc72f36b",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174a00b11c129b27a88fc72f36b",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178a00b11c129b27a88fc72f36b",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6DPYiyq5kWVQS4RGwxzPC7",
    "genre": "hip hop",
    "name": "Dr. Dre",
    "images": [
      {
        "url": "https://i.scdn.co/image/83d2489cade1dadcdc533ddbcd74993d0ca6d4cb",
        "height": 1005,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/170254ebdd747f4e7045df1cae8f11a42dc1a547",
        "height": 643,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/dd4a7102c5e1897bab2b1fa4bbc086fbe2fc87dc",
        "height": 201,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/85ebf2f6c52139b3384b596063678b47ab0fcb95",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "5K4W6rqBFWDnAN6FQUkS6x",
    "genre": "hip hop",
    "name": "Kanye West",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb6e835a500e791bf9c27a422a",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051746e835a500e791bf9c27a422a",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1786e835a500e791bf9c27a422a",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2YZyLoL8N0Wb9xBt1NhZWg",
    "genre": "hip hop",
    "name": "Kendrick Lamar",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb39ba6dcd4355c03de0b50918",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517439ba6dcd4355c03de0b50918",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17839ba6dcd4355c03de0b50918",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2D5Wbsa1bfX2Vb3Ipecpa2",
    "genre": "hip hop",
    "name": "Run-D.M.C.",
    "images": []
  },
  {
    "id": "2wIVse2owClT7go1WT98tk",
    "genre": "hip hop",
    "name": "Missy Elliott",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebf6691f40d906f097e9fbaa4c",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174f6691f40d906f097e9fbaa4c",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178f6691f40d906f097e9fbaa4c",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4Z8W4fKeB5YxbusRsdQVPb",
    "genre": "indie",
    "name": "Radiohead",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eba03696716c9ee605006047fd",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174a03696716c9ee605006047fd",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178a03696716c9ee605006047fd",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3yY2gUcIsjMr8hjo51PoJ8",
    "genre": "indie",
    "name": "The Smiths",
    "images": [
      {
        "url": "https://i.scdn.co/image/481b980af463122013e4578c08fb8c5cbfaed1e9",
        "height": 1516,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/4bf08a9e6eea088b20d4092d1322bbd3f39ff9af",
        "height": 970,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/bd4c7f5ff2c5c4385604e60c71eac1dd498ddbd9",
        "height": 303,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/d3a2542f2811b5b01ee3483ec7c193f72a882ea1",
        "height": 97,
        "width": 64
      }
    ]
  },
  {
    "id": "3kjuyTCjPG1WMFCiyc5IuB",
    "genre": "indie",
    "name": "Arcade Fire",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb57c6e5fa2170e9a938f4a880",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517457c6e5fa2170e9a938f4a880",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17857c6e5fa2170e9a938f4a880",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6zvul52xwTWzilBZl6BUbT",
    "genre": "indie",
    "name": "Pixies",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebcc5ad1ceb002d7bf44218283",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174cc5ad1ceb002d7bf44218283",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178cc5ad1ceb002d7bf44218283",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0epOFNiUfyON9EYx7Tpr6V",
    "genre": "indie",
    "name": "The Strokes",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebc3b137793230f4043feb0089",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174c3b137793230f4043feb0089",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178c3b137793230f4043feb0089",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4LEiUm1SRbFMgfqnQTwUbQ",
    "genre": "indie",
    "name": "Bon Iver",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb1a0c1f04c95539fd55ef0ebb",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051741a0c1f04c95539fd55ef0ebb",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1781a0c1f04c95539fd55ef0ebb",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5BvJzeQpmsdsFp4HGUYUEx",
    "genre": "indie",
    "name": "Vampire Weekend",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb0bb49b0b71ab3f5871860617",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051740bb49b0b71ab3f5871860617",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1780bb49b0b71ab3f5871860617",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3iOvXCl6edW5Um0fXEBRXy",
    "genre": "indie",
    "name": "The xx",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb3a96db4736ef035e1fcb2516",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051743a96db4736ef035e1fcb2516",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1783a96db4736ef035e1fcb2516",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1moxjboGR7GNWYIMWsRjgG",
    "genre": "indie",
    "name": "Florence + The Machine",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe3c37f869b830d1cf1ec829a",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e3c37f869b830d1cf1ec829a",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e3c37f869b830d1cf1ec829a",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5INjqkS1o8h1imAzPqGZBb",
    "genre": "indie",
    "name": "Tame Impala",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb90357ef28b3a012a1d1b2fa2",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517490357ef28b3a012a1d1b2fa2",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17890357ef28b3a012a1d1b2fa2",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0dmPX6ovclgOy8WWJaFEUU",
    "genre": "electronic",
    "name": "Kraftwerk",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebc46999e5afaf35c91cbe652b",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174c46999e5afaf35c91cbe652b",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178c46999e5afaf35c91cbe652b",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4tZwfgrHOc3mvqYlEYSvVi",
    "genre": "electronic",
    "name": "Daft Punk",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebdc93bb227980211b325b9d70",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174dc93bb227980211b325b9d70",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178dc93bb227980211b325b9d70",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6kBDZFXuLrZgHnvmPu9NsG",
    "genre": "electronic",
    "name": "Aphex Twin",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebaa3c91d792eb520a5d58daa5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174aa3c91d792eb520a5d58daa5",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178aa3c91d792eb520a5d58daa5",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1GhPHrq36VKCY3ucVaZCfo",
    "genre": "electronic",
    "name": "The Chemical Brothers",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebae05213e52565bfd7e7489b3",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174ae05213e52565bfd7e7489b3",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178ae05213e52565bfd7e7489b3",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5MhLmv7GgyjbxGqiIGasvT",
    "genre": "electronic",
    "name": "Jean-Michel Jarre",
    "images": [
      {
        "url": "https://i.scdn.co/image/b52c1d09b0fb64ab4a88b84f3166dc5886826be1",
        "height": 1000,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/dcfb5f6c56b0353bdc972be58cf4d7028ebddb29",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/73a822c1f3c5df1143574a3c80ebfb5ae1006b10",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/8f91842a1058c9a1a4a059def4992644df226e38",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "2CIMQHirSU0MQqyYHq0eOx",
    "genre": "electronic",
    "name": "Deadmau5",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb89ffabe57a25cedeca3309e7",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517489ffabe57a25cedeca3309e7",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17889ffabe57a25cedeca3309e7",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "19SmlbABtI4bXz864MLqOS",
    "genre": "electronic",
    "name": "Carl Cox",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb6c21953cc4157aa2f4627ff3",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051746c21953cc4157aa2f4627ff3",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1786c21953cc4157aa2f4627ff3",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3OsRAKCvk37zwYcnzRf5XF",
    "genre": "electronic",
    "name": "Moby",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb85e8c6cc75e2810460c84564",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517485e8c6cc75e2810460c84564",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17885e8c6cc75e2810460c84564",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4Y7tXHSEejGu1vQ9bwDdXW",
    "genre": "electronic",
    "name": "Fatboy Slim",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebc20ed3229eeced918966a009",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174c20ed3229eeced918966a009",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178c20ed3229eeced918966a009",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5he5w2lnU9x7JFhnwcekXX",
    "genre": "electronic",
    "name": "Skrillex",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe32002317387b6d659308a94",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e32002317387b6d659308a94",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e32002317387b6d659308a94",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1Cs0zKBU1kc0i8ypK3B9ai",
    "genre": "dance",
    "name": "David Guetta",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebf150017ca69c8793503c2d4f",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174f150017ca69c8793503c2d4f",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178f150017ca69c8793503c2d4f",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7CajNmpbOovFoOoasH2HaY",
    "genre": "dance",
    "name": "Calvin Harris",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb1e4bcd2bef1896648762dd6b",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051741e4bcd2bef1896648762dd6b",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1781e4bcd2bef1896648762dd6b",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1vCWHaC5f2uS3yhpwWbIA6",
    "genre": "dance",
    "name": "Avicii",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebae07171f989fb39736674113",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174ae07171f989fb39736674113",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178ae07171f989fb39736674113",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2o5jDhtHVPhrJdv3cEQ99Z",
    "genre": "dance",
    "name": "Tiësto",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe84e08fb1dfa2bf9b5a61563",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e84e08fb1dfa2bf9b5a61563",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e84e08fb1dfa2bf9b5a61563",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0SfsnGyD8FpIN4U4WCkBZ5",
    "genre": "dance",
    "name": "Armin van Buuren",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb90db664ba1bf6574239f859d",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517490db664ba1bf6574239f859d",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17890db664ba1bf6574239f859d",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5fMUXHkw8R8eOP2RNVYEZX",
    "genre": "dance",
    "name": "Diplo",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebdf01727aa674ddefa777797a",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174df01727aa674ddefa777797a",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178df01727aa674ddefa777797a",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5MO2kbaGGA2a8kL4c9qqHq",
    "genre": "dance",
    "name": "Paul Oakenfold",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebdcc8d87d5dd4dbed3dd0c95e",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174dcc8d87d5dd4dbed3dd0c95e",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178dcc8d87d5dd4dbed3dd0c95e",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "23fqKkggKUBHNkbKtXEls4",
    "genre": "dance",
    "name": "Kygo",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe5ea1aa1404629c12ad86658",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e5ea1aa1404629c12ad86658",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e5ea1aa1404629c12ad86658",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2qxJFvFYMEDqd7ui6kSAcq",
    "genre": "dance",
    "name": "Zedd",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe28762aed82cde1178fb3873",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e28762aed82cde1178fb3873",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e28762aed82cde1178fb3873",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "64KEffDW9EtZ1y2vBYgq8T",
    "genre": "dance",
    "name": "Marshmello",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb53ca421f91678c26b4f15512",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517453ca421f91678c26b4f15512",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17853ca421f91678c26b4f15512",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0kbYTNQb4Pb1rPbbaF0pT4",
    "genre": "jazz",
    "name": "Miles Davis",
    "images": [
      {
        "url": "https://i.scdn.co/image/423e826b3c1b23930a255d7cbc2daf733f795507",
        "height": 1000,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/a318c54208af38364d131a54ced2416423696018",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/8496e6ea230dd47311d85dcf860015792f5ada42",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/b1af952a7fb8ac2c4467868d61b5752fc1a01cf0",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "19eLuQmk9aCobbVDHc6eek",
    "genre": "jazz",
    "name": "Louis Armstrong",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6772690000c46c4a0e9d5e55f9f3721c3243c5",
        "height": 1000,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/ab6772690000dd224a0e9d5e55f9f3721c3243c5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6772690000bac34a0e9d5e55f9f3721c3243c5",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/ab67726900008f744a0e9d5e55f9f3721c3243c5",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "4F7Q5NV6h5TSwCainz8S5A",
    "genre": "jazz",
    "name": "Duke Ellington",
    "images": [
      {
        "url": "https://i.scdn.co/image/1e24691a352233bbe989a311d921f17e7892a87e",
        "height": 1154,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/c169af91bf56ac7d3962000f6ab237e1586d9732",
        "height": 739,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/b6a297e56436a75ffcab7f594dafc46c9872f793",
        "height": 231,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/2ac71fb8c2ff235d2484d40d274473767eaf07b5",
        "height": 74,
        "width": 64
      }
    ]
  },
  {
    "id": "2hGh5VOeeqimQFxqXvfCUf",
    "genre": "jazz",
    "name": "John Coltrane",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb73c7f7505c1af82929ec41df",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517473c7f7505c1af82929ec41df",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17873c7f7505c1af82929ec41df",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4Ww5mwS7BWYjoZTUIrMHfC",
    "genre": "jazz",
    "name": "Charlie Parker",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb5642427a0fb3988948c9bec4",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051745642427a0fb3988948c9bec4",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1785642427a0fb3988948c9bec4",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5V0MlUE1Bft0mbLlND7FJz",
    "genre": "jazz",
    "name": "Ella Fitzgerald",
    "images": [
      {
        "url": "https://i.scdn.co/image/3c1d23141059785c8a863137d176319329dc17ef",
        "height": 1048,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/ab7d0c038d876a9ed5a21afb83d6ba760430cf90",
        "height": 671,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/b4bdb342ca1878e96acf33c5b972491d93cd909c",
        "height": 210,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/5091b7625a1bd565e9c1d37922a5b5119b380645",
        "height": 67,
        "width": 64
      }
    ]
  },
  {
    "id": "4PDpGtF16XpqvXxsrFwQnN",
    "genre": "jazz",
    "name": "Thelonious Monk",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb66a78e11df5c02af9346db02",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517466a78e11df5c02af9346db02",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17866a78e11df5c02af9346db02",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1YzCsTRb22dQkh9lghPIrp",
    "genre": "jazz",
    "name": "Billie Holiday",
    "images": [
      {
        "url": "https://i.scdn.co/image/4efa6b6871a0f672b78b3d16fd5a03c6cd212d58",
        "height": 828,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/11f685f3011fd163c386ce1afe7ce543ad814817",
        "height": 530,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/0f472c69891d82d5049f7de35426b2fdeb6051c0",
        "height": 166,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/73b9538798c13c7be7558d69b02019cf19e1d5db",
        "height": 53,
        "width": 64
      }
    ]
  },
  {
    "id": "2ZvrvbQNrHKwjT7qfGFFUW",
    "genre": "jazz",
    "name": "Herbie Hancock",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebca17170af02af227d6ea0c31",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174ca17170af02af227d6ea0c31",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178ca17170af02af227d6ea0c31",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3kUKwTJdH8FuWzF8p6Dg9E",
    "genre": "jazz",
    "name": "Dave Brubeck",
    "images": [
      {
        "url": "https://i.scdn.co/image/a6a0e86fd68166c7cd4425bc0eadab5131f4fbd1",
        "height": 989,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/0634b43c87b71297febbc7b9f9b0661779fa80e7",
        "height": 633,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/9dd448f33ac7567874c8b303e6f81cb770c04ea1",
        "height": 198,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/0b10d3b69a26503756fbb36ca5f73092f5e2ff94",
        "height": 63,
        "width": 64
      }
    ]
  },
  {
    "id": "2wOqMjp9TyABvtHdOSOTUS",
    "genre": "classical",
    "name": "Ludwig van Beethoven",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eba636b0b244253f602a629796",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174a636b0b244253f602a629796",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178a636b0b244253f602a629796",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5aIqB5nVVvmFsvSdExz408",
    "genre": "classical",
    "name": "Johann Sebastian Bach",
    "images": [
      {
        "url": "https://i.scdn.co/image/a2ec08fe69ecec2748fbc764aede8f1b03ae8f88",
        "height": 479,
        "width": 479
      },
      {
        "url": "https://i.scdn.co/image/53ec9642cf116eca56d88284c40bb1497585e28e",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/438b280a22e63f994fd39feb031683fb861a31cb",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "4NJhFmfw43RLBLjQvxDuRS",
    "genre": "classical",
    "name": "Wolfgang Amadeus Mozart",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb7fa9108c6dadb8c3ec21da88",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051747fa9108c6dadb8c3ec21da88",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1787fa9108c6dadb8c3ec21da88",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7y97mc3bZRFXzT2szRM4L4",
    "genre": "classical",
    "name": "Frédéric Chopin",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe55372097569b7b56b439365",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e55372097569b7b56b439365",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e55372097569b7b56b439365",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3MKCzCnpzw3TjUYs2v7vDA",
    "genre": "classical",
    "name": "Pyotr Ilyich Tchaikovsky",
    "images": [
      {
        "url": "https://i.scdn.co/image/9a7c31f43e22a95f6d3c57baf4f87a3a9d2b93e0",
        "height": 1000,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/697936fd6d369e8d2d36b38e385c9b2b478524cb",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/98e3a081097659f0d7554b232977019750972902",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/0fc4439f1b6b478408292baa38bd44d9268e4b33",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "1Uff91EOsvd99rtAupatMP",
    "genre": "classical",
    "name": "Claude Debussy",
    "images": [
      {
        "url": "https://i.scdn.co/image/5e1155c852578ddf5d2cfea94ccb3a8a65efa882",
        "height": 458,
        "width": 387
      },
      {
        "url": "https://i.scdn.co/image/d9bf00a7a314028df902da1d026a9844a3365d61",
        "height": 237,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/155965c396369f20273bc6ba6a14f4185ffad805",
        "height": 76,
        "width": 64
      }
    ]
  },
  {
    "id": "7ie36YytMoKtPiL7tUvmoE",
    "genre": "classical",
    "name": "Igor Stravinsky",
    "images": [
      {
        "url": "https://i.scdn.co/image/49da328b0629313b2c452bf35d8c50d013274f5b",
        "height": 1374,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/47483808cf1e58366c0c7f66b5caa0c254f28906",
        "height": 879,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/43b169c55ce3cb6744fa8395f593dc0352f618fc",
        "height": 275,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/fcd7e76ec595e7277e7affdeb77a6aee358bc2f6",
        "height": 88,
        "width": 64
      }
    ]
  },
  {
    "id": "2QOIawHpSlOwXDvSqQ9YJR",
    "genre": "classical",
    "name": "Antonio Vivaldi",
    "images": [
      {
        "url": "https://i.scdn.co/image/9785700bae86f991f78183076861c7342a4bcf90",
        "height": 1194,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/12caee0d8c2843b37e2b19da99e385010a2f8c5b",
        "height": 764,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/4bdf9bc839ae7d30e69f6399ac47c74c1bd62212",
        "height": 239,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/30702c2e565f3c36fcc65673cf2f19fe852ca7c0",
        "height": 76,
        "width": 64
      }
    ]
  },
  {
    "id": "5wTAi7QkpP6kp8a54lmTOq",
    "genre": "classical",
    "name": "Johannes Brahms",
    "images": [
      {
        "url": "https://i.scdn.co/image/d5c6af18beb1411ab49c2976647e0d370bf66a88",
        "height": 752,
        "width": 514
      },
      {
        "url": "https://i.scdn.co/image/841b4adc1a4e66906d99229aaaec26306d6aed92",
        "height": 293,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/39d3c79df7fed6b4c597babaa24586d40fa44a45",
        "height": 94,
        "width": 64
      }
    ]
  },
  {
    "id": "0Kekt6CKSo0m5mivKcoH51",
    "genre": "classical",
    "name": "Sergei Rachmaninoff",
    "images": [
      {
        "url": "https://i.scdn.co/image/463e3c5c3e814761532f554913cf2af456bcba59",
        "height": 1205,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/774dbc0919edd260d091aace2787caf4a8e59448",
        "height": 771,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/fccf9d0d652d13bb34b1cd8a5f6aa37f839a2a27",
        "height": 241,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/b8330117c874452738ae70abd12561af07c9867f",
        "height": 77,
        "width": 64
      }
    ]
  },
  {
    "id": "5M52tdBnJaKSvOpJGz8mfZ",
    "genre": "metal",
    "name": "Black Sabbath",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb4870cd833ebe1092601820c3",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051744870cd833ebe1092601820c3",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1784870cd833ebe1092601820c3",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6mdiAmATAx73kdxrNrnlao",
    "genre": "metal",
    "name": "Iron Maiden",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebf9978ad4808f6f2723124d19",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174f9978ad4808f6f2723124d19",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178f9978ad4808f6f2723124d19",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2ye2Wgw4gimLv2eAKyk1NB",
    "genre": "metal",
    "name": "Metallica",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb69ca98dd3083f1082d740e44",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517469ca98dd3083f1082d740e44",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17869ca98dd3083f1082d740e44",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1IQ2e1buppatiN1bxUVkrk",
    "genre": "metal",
    "name": "Slayer",
    "images": [
      {
        "url": "https://i.scdn.co/image/8c81130db7b5f933412c4906c30327817f1e1b43",
        "height": 667,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/643c0c72a9e44c2b65f0b9af158f525d55a15988",
        "height": 427,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/c8b7671ef95a1b028a74fef6616111c3cd5c3039",
        "height": 133,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/82cbdfac153cd29f35adca4f6d4aa8c5b40e9c22",
        "height": 43,
        "width": 64
      }
    ]
  },
  {
    "id": "14pVkFUHDL207LzLHtSA18",
    "genre": "metal",
    "name": "Pantera",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe21999c0102c240bdf094d9b",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e21999c0102c240bdf094d9b",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e21999c0102c240bdf094d9b",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1Yox196W7bzVNZI7RBaPnf",
    "genre": "metal",
    "name": "Megadeth",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb3f19bad1d41dceb90d8b4cf5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051743f19bad1d41dceb90d8b4cf5",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1783f19bad1d41dceb90d8b4cf5",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2tRsMl4eGxwoNabM08Dm4I",
    "genre": "metal",
    "name": "Judas Priest",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb4b3cfc24737acb15e73e8bd6",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051744b3cfc24737acb15e73e8bd6",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1784b3cfc24737acb15e73e8bd6",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1DFr97A9HnbV3SKTJFu62M",
    "genre": "metal",
    "name": "Motörhead",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebf2602e605b7684b5b7ce07c1",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174f2602e605b7684b5b7ce07c1",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178f2602e605b7684b5b7ce07c1",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5eAWCfyUhZtHHtBdNk56l1",
    "genre": "metal",
    "name": "System of a Down",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb60063d3451ade8f9fab397c2",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517460063d3451ade8f9fab397c2",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17860063d3451ade8f9fab397c2",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "05fG473iIaoy82BF1aGhL8",
    "genre": "metal",
    "name": "Slipknot",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebd0cdb283a7384a0edb665182",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174d0cdb283a7384a0edb665182",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178d0cdb283a7384a0edb665182",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7guDJrEfX3qb6FEbdPA5qi",
    "genre": "r&b",
    "name": "Stevie Wonder",
    "images": [
      {
        "url": "https://i.scdn.co/image/c59faacbed7aa770266bad048660810eca204108",
        "height": 1008,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/37c7875911b1d8195b05d40061a86bd01908a0d9",
        "height": 645,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/3b24b51bf11404089c4d66acd0c612539c77e7e7",
        "height": 202,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/05489744160e3f6f94f707fa1e2a6d4bbd14a298",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "7nwUJBm0HE4ZxD3f5cy5ok",
    "genre": "r&b",
    "name": "Aretha Franklin",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebf12270128127ba170f90097d",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174f12270128127ba170f90097d",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178f12270128127ba170f90097d",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3koiLjNrgRTNbOwViDipeA",
    "genre": "r&b",
    "name": "Marvin Gaye",
    "images": [
      {
        "url": "https://i.scdn.co/image/cf79bd3e5c787e2ec152eeb1ea5538b0d4cf1434",
        "height": 1232,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/f69e669cd95c6008c6220fd060982ff9516ed636",
        "height": 788,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/c2c1b3612f38b206411173c168b912d306b5c196",
        "height": 246,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/aa28a931be2da1c33411b0d6c106bcf6e3d17de7",
        "height": 79,
        "width": 64
      }
    ]
  },
  {
    "id": "3DiDSECUqqY1AuBP8qtaIa",
    "genre": "r&b",
    "name": "Alicia Keys",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebebfd16a3bca87c31c1e20576",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174ebfd16a3bca87c31c1e20576",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178ebfd16a3bca87c31c1e20576",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "23zg3TcAtWQy7J6upgbUnj",
    "genre": "r&b",
    "name": "Usher",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb716114797a4a644c67c5fa72",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174716114797a4a644c67c5fa72",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178716114797a4a644c67c5fa72",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2mxe0TnaNL039ysAj51xPQ",
    "genre": "r&b",
    "name": "R. Kelly",
    "images": [
      {
        "url": "https://i.scdn.co/image/b81390065f0c65c26270a4ca1d2ceae3e30efed6",
        "height": 1335,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/4047fbf18d31ff86cab5a01934b46c65fce28ab4",
        "height": 854,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/5811175f1f333fa7fdc1e5d543953333ef147bcc",
        "height": 267,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/920c3f81ab70f4bd744adb9f2749b00a3c7b3ead",
        "height": 85,
        "width": 64
      }
    ]
  },
  {
    "id": "6O74knDqdv3XaWtkII7Xjp",
    "genre": "r&b",
    "name": "Boyz II Men",
    "images": [
      {
        "url": "https://i.scdn.co/image/c8b0d67be35852171d04d7309c2cfe1992a8a4eb",
        "height": 500,
        "width": 500
      },
      {
        "url": "https://i.scdn.co/image/8a5d7e430967cc09022e53c49528587d196b66df",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/db9713492df7fdf105b12cf2833d273797421c48",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "1XkoF8ryArs86LZvFOkbyr",
    "genre": "r&b",
    "name": "Mary J. Blige",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb3d7888ba4d2bf67fe6b64a55",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051743d7888ba4d2bf67fe6b64a55",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1783d7888ba4d2bf67fe6b64a55",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6vWDO969PvNqNYHIOW5v0m",
    "genre": "r&b",
    "name": "Beyoncé",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb7eaa373538359164b843f7c0",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051747eaa373538359164b843f7c0",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1787eaa373538359164b843f7c0",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "19y5MFBH7gohEdGwKM7QsP",
    "genre": "r&b",
    "name": "Luther Vandross",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebc609e4ef97e896a2b32b1473",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174c609e4ef97e896a2b32b1473",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178c609e4ef97e896a2b32b1473",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7GaxyUddsPok8BuhxN6OUW",
    "genre": "soul",
    "name": "James Brown",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb158342aa8bb8a192c778f2a5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174158342aa8bb8a192c778f2a5",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178158342aa8bb8a192c778f2a5",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1eYhYunlNJlDoQhtYBvPsi",
    "genre": "soul",
    "name": "Ray Charles",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb6fc460f10177fa38af69b8bf",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051746fc460f10177fa38af69b8bf",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1786fc460f10177fa38af69b8bf",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6hnWRPzGGKiapVX1UCdEAC",
    "genre": "soul",
    "name": "Sam Cooke",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb41aaa3a05d2ddba59454273e",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517441aaa3a05d2ddba59454273e",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17841aaa3a05d2ddba59454273e",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "60df5JBRRPcnSpsIMxxwQm",
    "genre": "soul",
    "name": "Otis Redding",
    "images": [
      {
        "url": "https://i.scdn.co/image/4ad89c805aff0fb76b01b6b62b39e21fcd8943c3",
        "height": 751,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/a5897eff01844c42d894a586e618ebc4aa0b9d2f",
        "height": 481,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/49d904a0628ef52dc280b5320bb6538b1c9e6877",
        "height": 150,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/7f1d2125c3968d0f631f4995ec51a76f2206ecff",
        "height": 48,
        "width": 64
      }
    ]
  },
  {
    "id": "0iOVhN3tnSvgDbcg25JoJb",
    "genre": "soul",
    "name": "Etta James",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb058531dfd9746a96ad85265f",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174058531dfd9746a96ad85265f",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178058531dfd9746a96ad85265f",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1ThoqLcyIYvZn7iWbj8fsj",
    "genre": "soul",
    "name": "Bill Withers",
    "images": [
      {
        "url": "https://i.scdn.co/image/96b85aec6907206572527e1eeec6569d5e977a38",
        "height": 1143,
        "width": 834
      },
      {
        "url": "https://i.scdn.co/image/71f81180fa488ceb52df664faadb1d7acf20658e",
        "height": 877,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/7d544b8f4344ec6f206e612d0207ffeb5386b571",
        "height": 274,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/2ac716bdcc95f3639d6cf3cea19e2c9bde5ed509",
        "height": 88,
        "width": 64
      }
    ]
  },
  {
    "id": "0h9smro0z3HqUbD94jotU8",
    "genre": "soul",
    "name": "Smokey Robinson",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb625f46178267731e1af0b368",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174625f46178267731e1af0b368",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178625f46178267731e1af0b368",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2AV6XDIs32ofIJhkkDevjm",
    "genre": "soul",
    "name": "Curtis Mayfield",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebeea0f2f51d7969bbb4000f92",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174eea0f2f51d7969bbb4000f92",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178eea0f2f51d7969bbb4000f92",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7G1GBhoKtEPnP86X2PvEYO",
    "genre": "soul",
    "name": "Nina Simone",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb136c51c848c26a6cce7f9e56",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174136c51c848c26a6cce7f9e56",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178136c51c848c26a6cce7f9e56",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3dkbV4qihUeMsqN4vBGg93",
    "genre": "soul",
    "name": "Al Green",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb64382b1015df52a6bc32c3b7",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517464382b1015df52a6bc32c3b7",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17864382b1015df52a6bc32c3b7",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6BH2lormtpjy3X9DyrGHVj",
    "genre": "reggae",
    "name": "Bob Marley",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab67616d0000b273020afd88c3c961749b339872",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616d00001e02020afd88c3c961749b339872",
        "height": 300,
        "width": 300
      },
      {
        "url": "https://i.scdn.co/image/ab67616d00004851020afd88c3c961749b339872",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "0oea1hwGMfUxZbLxJc1XUN",
    "genre": "reggae",
    "name": "Peter Tosh",
    "images": [
      {
        "url": "https://i.scdn.co/image/c935305719f26d05c9d9b51b5b838d5448b44a27",
        "height": 667,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/ff0dc4f22c8e5074d7996313d785785a555e46bb",
        "height": 427,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/aa79350754a8e9ef651229e7cc5a6d127940c8df",
        "height": 133,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/1bbc9aa845b04995c75e7e06f7b5649aa3dd5605",
        "height": 43,
        "width": 64
      }
    ]
  },
  {
    "id": "3rJ3m1tM6vUgiWLjfV8sRf",
    "genre": "reggae",
    "name": "Jimmy Cliff",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb11bdad2b191ac35053d34bd2",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517411bdad2b191ac35053d34bd2",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17811bdad2b191ac35053d34bd2",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6qaKS0nzGP4hfjl4aFZmEU",
    "genre": "reggae",
    "name": "Burning Spear",
    "images": [
      {
        "url": "https://i.scdn.co/image/be146a84cc7f88594eba0ef842a7dc3ce7836b24",
        "height": 1070,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/e1f6ae0896aecdfb72a0c69f3b9dafa2c6a146dd",
        "height": 685,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/4fe4cc7f28eb1177b8a6f291b442366e12774dc1",
        "height": 214,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/bbf5ccb1da0bbe3603ea0ed1e7ca01df046a3bbc",
        "height": 68,
        "width": 64
      }
    ]
  },
  {
    "id": "6ZFv3wQwwWPiVDWhv0mjQK",
    "genre": "reggae",
    "name": "Toots and the Maytals",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb346451ca43eb84f810f13b96",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174346451ca43eb84f810f13b96",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178346451ca43eb84f810f13b96",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "389zc5Rwe0MPcE6mSF4AjC",
    "genre": "reggae",
    "name": "Bunny Wailer",
    "images": [
      {
        "url": "https://i.scdn.co/image/6e81ba687028f9da4d4d86434748789ed62f6c71",
        "height": 1324,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/92e18eea8b31678ef640b3acabb6902fdb41ca83",
        "height": 847,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/6be370c7d0d4ab187b66feb5bf2559c9fc696f38",
        "height": 265,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/eac02e39840db29c53c7bc71f89b3e3250005d48",
        "height": 85,
        "width": 64
      }
    ]
  },
  {
    "id": "5keeQyPKYRxUCKDMECTXG3",
    "genre": "reggae",
    "name": "Black Uhuru",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb5444325144ecc7fc7649fd91",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051745444325144ecc7fc7649fd91",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1785444325144ecc7fc7649fd91",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5EvFsr3kj42KNv97ZEnqij",
    "genre": "reggae",
    "name": "Shaggy",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb356dc7e9ba8792cb86a0c50c",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174356dc7e9ba8792cb86a0c50c",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178356dc7e9ba8792cb86a0c50c",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3Isy6kedDrgPYoTS1dazA9",
    "genre": "reggae",
    "name": "Sean Paul",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb60c3e9abe7327c0097738f22",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517460c3e9abe7327c0097738f22",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17860c3e9abe7327c0097738f22",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3QJzdZJYIAcoET1GcfpNGi",
    "genre": "reggae",
    "name": "Damian Marley",
    "images": [
      {
        "url": "https://i.scdn.co/image/f05f2667aac2bbccd9bf8fcc658b647533257f16",
        "height": 1333,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/8c6081bd641058fada4bc68f35d37b8069cbb909",
        "height": 853,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/7b2416c9e67896deedfb08b1503e9ae4d600f48c",
        "height": 267,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/242871e807e732e86bbc1ee298e9619b333e9bdb",
        "height": 85,
        "width": 64
      }
    ]
  },
  {
    "id": "1u7kkVrr14iBvrpYnZILJR",
    "genre": "punk",
    "name": "The Sex Pistols",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebd3fa01fd4baad1158dd2fd8b",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174d3fa01fd4baad1158dd2fd8b",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178d3fa01fd4baad1158dd2fd8b",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1co4F2pPNH8JjTutZkmgSm",
    "genre": "punk",
    "name": "The Ramones",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb5b9f46a5c5bf8243179d56b0",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051745b9f46a5c5bf8243179d56b0",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1785b9f46a5c5bf8243179d56b0",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3RGLhK1IP9jnYFH4BRFJBS",
    "genre": "punk",
    "name": "The Clash",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb2fc4d22f2e060511db2ae971",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051742fc4d22f2e060511db2ae971",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1782fc4d22f2e060511db2ae971",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "30U8fYtiNpeA5KH6H87QUV",
    "genre": "punk",
    "name": "Dead Kennedys",
    "images": [
      {
        "url": "https://i.scdn.co/image/725a76a15036422522a106bf153471a273e5e93f",
        "height": 786,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/c701ad2f834deac519c50fd902275ba61f2c3bfa",
        "height": 503,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/85a6b9c735ddc8ac5bd994660dcd4787bef84bfc",
        "height": 157,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/a19ae5d82d1f8b10d7707579a55586afcadaeb76",
        "height": 50,
        "width": 64
      }
    ]
  },
  {
    "id": "4BFMTELQyWJU1SwqcXMBm3",
    "genre": "punk",
    "name": "Iggy Pop & The Stooges",
    "images": [
      {
        "url": "https://i.scdn.co/image/1d9f0cf8e6d8d51f28369eccd78dca2882fb0d83",
        "height": 823,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/0ca5b7b25505a312622da1ed90ab412c0bbf6717",
        "height": 527,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/8f10d358610778872b6de9b5f876c7bdc2a70ac7",
        "height": 165,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/64bb39146feef25bdc2585423e5a98e7d94ce44d",
        "height": 53,
        "width": 64
      }
    ]
  },
  {
    "id": "2yJwXpWAQOOl5XFzbCxLs9",
    "genre": "punk",
    "name": "Bad Religion",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb785d6af86b16c8747ff61e42",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174785d6af86b16c8747ff61e42",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178785d6af86b16c8747ff61e42",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1cXi8ALPQCBHZbf0EgP4Ey",
    "genre": "punk",
    "name": "Misfits",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb030d67ff9576754ff230b2c0",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174030d67ff9576754ff230b2c0",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178030d67ff9576754ff230b2c0",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2DxlS3lTLFIq70S7ap5H3y",
    "genre": "punk",
    "name": "Buzzcocks",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb694abbe7669a250140e988bf",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174694abbe7669a250140e988bf",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178694abbe7669a250140e988bf",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7oPftvlwr6VrsViSDV7fJY",
    "genre": "punk",
    "name": "Green Day",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb6ff0cd5ef2ecf733804984bb",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051746ff0cd5ef2ecf733804984bb",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1786ff0cd5ef2ecf733804984bb",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5Mhs3Eu8lU6sRCtRYsmABV",
    "genre": "punk",
    "name": "Black Flag",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb64f57c3f54c287c42cadf773",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517464f57c3f54c287c42cadf773",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17864f57c3f54c287c42cadf773",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "74ASZWbe4lXaubB36ztrGX",
    "genre": "folk",
    "name": "Bob Dylan",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb791742524609864273747ef5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174791742524609864273747ef5",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178791742524609864273747ef5",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5hW4L92KnC6dX9t7tYM4Ve",
    "genre": "folk",
    "name": "Joni Mitchell",
    "images": [
      {
        "url": "https://i.scdn.co/image/68cfb061951dbd44c95422a54cb70baec0722ca3",
        "height": 784,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/ebaff9c356b21f97cb877d8e4607568b3e0cae75",
        "height": 502,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/bc9f1f21ffa483e952a6d012420644554f91f624",
        "height": 157,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/938613e2fe5e0ca97a524675feabea263400222f",
        "height": 50,
        "width": 64
      }
    ]
  },
  {
    "id": "70cRZdQywnSFp9pnc2WTCE",
    "genre": "folk",
    "name": "Simon & Garfunkel",
    "images": [
      {
        "url": "https://i.scdn.co/image/afde2fdd14f8c8ca23393f257e3a369a234a24b6",
        "height": 1241,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/3bffe5e67788e9e64a4f8368f1010f20c269d518",
        "height": 794,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/852145f3972cb8b6c431ca7b1c9d5bc839a8a06a",
        "height": 248,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/b32f349333d0710b002b0439fc504558e46bcb07",
        "height": 79,
        "width": 64
      }
    ]
  },
  {
    "id": "5l8VQNuIg0turYE1VtM9zV",
    "genre": "folk",
    "name": "Leonard Cohen",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebd09c1295779cfb71683cee99",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174d09c1295779cfb71683cee99",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178d09c1295779cfb71683cee99",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1EevBGfUh3RSQSGpluxgBm",
    "genre": "folk",
    "name": "Joan Baez",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb05c5f9bf4906453af63025aa",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517405c5f9bf4906453af63025aa",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17805c5f9bf4906453af63025aa",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4rAgFKtlTr66ic18YZZyF1",
    "genre": "folk",
    "name": "Woody Guthrie",
    "images": [
      {
        "url": "https://i.scdn.co/image/cf3ab17e21b7cd3c5776c4d2046be2a3683bcc87",
        "height": 635,
        "width": 475
      },
      {
        "url": "https://i.scdn.co/image/1350c916b756aa9c4b2130a96ab3533b5e9515e4",
        "height": 267,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/23205ecccd713135f22a58896ab2b249b8e8bf7e",
        "height": 86,
        "width": 64
      }
    ]
  },
  {
    "id": "5c3GLXai8YOMid29ZEuR9y",
    "genre": "folk",
    "name": "Nick Drake",
    "images": [
      {
        "url": "https://i.scdn.co/image/d364b498f85ae764cd278fbba9a8ed7f00c3e434",
        "height": 1484,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/087fb05851e498c2791ca99000acf35b0fd49f19",
        "height": 950,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/9a74a7d885abe5da94ac812546d0146cfe4a1ceb",
        "height": 297,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/267080662cf3c019ea8020a4e0e8dd5a7be4d909",
        "height": 95,
        "width": 64
      }
    ]
  },
  {
    "id": "3X0tJzVYoWlfjLYI0Ridsw",
    "genre": "folk",
    "name": "Cat Stevens",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eba639ef3d431a7ac817edb917",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174a639ef3d431a7ac817edb917",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178a639ef3d431a7ac817edb917",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1CYsQCypByMVgnv17qsSbQ",
    "genre": "folk",
    "name": "Crosby, Stills & Nash",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb4e5018dad07ee004f171d7d3",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051744e5018dad07ee004f171d7d3",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1784e5018dad07ee004f171d7d3",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "16oZKvXb6WkQlVAjwo2Wbg",
    "genre": "folk",
    "name": "The Lumineers",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb0f882273183345499155d6ed",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051740f882273183345499155d6ed",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1780f882273183345499155d6ed",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5xLSa7l4IV1gsQfhAMvl0U",
    "genre": "blues",
    "name": "B.B. King",
    "images": [
      {
        "url": "https://i.scdn.co/image/ffb3ff26238fe635a230bb0feb59dd0a5b209b6f",
        "height": 1259,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/7e53bec2f958fa7fd1868124a0897cb0d08b60ee",
        "height": 806,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/8b4bbc1e769cc1cf78a6a369f3a8b0026631eb96",
        "height": 252,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/56746f2b047d78df56f077a02bf6720858d50454",
        "height": 81,
        "width": 64
      }
    ]
  },
  {
    "id": "4y6J8jwRAwO4dssiSmN91R",
    "genre": "blues",
    "name": "Muddy Waters",
    "images": [
      {
        "url": "https://i.scdn.co/image/b4ccc4c928c953fbe755c88c4774df70db977a5c",
        "height": 1000,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/40d562d19e9bf6bb6cd7b6886ec7608c281febca",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/70b34469333a24e5943cfb618cec424186a932fd",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/83fe49cb2913486ceb1877175f13beced10fc707",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "0f8MDDzIc6M4uH1xH0o0gy",
    "genre": "blues",
    "name": "Robert Johnson",
    "images": [
      {
        "url": "https://i.scdn.co/image/b8acc51743ff21f1d32e3f99922ca8283d3af0ce",
        "height": 1268,
        "width": 968
      },
      {
        "url": "https://i.scdn.co/image/e5e3a261affcf0d3e511f3c61c150340135f2bfd",
        "height": 838,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/e507ddf397233df8b490ce8d7220df85f1a9bb02",
        "height": 262,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/55770f73b852ea1d0c5189ce36d01ed5a1e0b8fa",
        "height": 84,
        "width": 64
      }
    ]
  },
  {
    "id": "0Wxy5Qka8BN9crcFkiAxSR",
    "genre": "blues",
    "name": "Howlin’ Wolf",
    "images": [
      {
        "url": "https://i.scdn.co/image/c2408f7f93e582b422af47aa72904a24397029d9",
        "height": 1100,
        "width": 818
      },
      {
        "url": "https://i.scdn.co/image/42a40543d2bde12565d33ee74a2566fd85b0c9f5",
        "height": 861,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/d436651ba6b691a4b1bf631e1020d04967c16089",
        "height": 269,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/2e43a2813672ed781d2395808c46957ae566197d",
        "height": 86,
        "width": 64
      }
    ]
  },
  {
    "id": "1yNOfXGQNGjAynk77wv85x",
    "genre": "blues",
    "name": "John Lee Hooker",
    "images": [
      {
        "url": "https://i.scdn.co/image/6bcff0a9ed464621c433fb5d369c2164ebd3d2d0",
        "height": 987,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/3b521a57a4507cbe4f981c1818af397f56614fdb",
        "height": 632,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/42b311e986453b8b3ad3693140bd13e23c896792",
        "height": 197,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/0f405cc6d77f02e3fc39665a7ea76308d26fdc08",
        "height": 63,
        "width": 64
      }
    ]
  },
  {
    "id": "0iOVhN3tnSvgDbcg25JoJb",
    "genre": "blues",
    "name": "Etta James",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb058531dfd9746a96ad85265f",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174058531dfd9746a96ad85265f",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178058531dfd9746a96ad85265f",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2gCsNOpiBaMNh20jQ5prf0",
    "genre": "blues",
    "name": "Buddy Guy",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebb421cddbc392e714006f6606",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174b421cddbc392e714006f6606",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178b421cddbc392e714006f6606",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5aygfDCEaX5KTZOxSCpT9o",
    "genre": "blues",
    "name": "Albert King",
    "images": [
      {
        "url": "https://i.scdn.co/image/bfb61e8da152782920e42784c2a72eed8620afc1",
        "height": 1584,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/4bc4a6c21e93322e264ccdc9116d009860359f60",
        "height": 1013,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/6dd4ca26c138d8276206f7b5f057b3abd2333bf0",
        "height": 317,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/5cec1d71f202cdcf322bdb65be71dd8314fe4688",
        "height": 101,
        "width": 64
      }
    ]
  },
  {
    "id": "5v8WPpMk60cqZbuZLdXjKY",
    "genre": "blues",
    "name": "Willie Dixon",
    "images": [
      {
        "url": "https://i.scdn.co/image/0e47d718bb067a06e5939ae578e106b0bb6bd2ba",
        "height": 996,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/a054fa32bc5139793652f8e2b084c10c6efca3af",
        "height": 637,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/a7da0e78dbd0b9a6d9b75ca154f4cd2c8ee5405a",
        "height": 199,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/b4fc7c01397c8807e6773052ca93e773a63f6fb1",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "5fsDcuclIe8ZiBD5P787K1",
    "genre": "blues",
    "name": "Stevie Ray Vaughan",
    "images": [
      {
        "url": "https://i.scdn.co/image/1de60c936683320769a1bfb6fba7f75902859085",
        "height": 1021,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/5bd95fbc961256c56560d838bd74d05be50701d4",
        "height": 654,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/a812f6770a18e269934733f69fba0daf93f3ae04",
        "height": 204,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/81bae876781fef5f3092c27a39f3b188f64bb98c",
        "height": 65,
        "width": 64
      }
    ]
  },
  {
    "id": "6kACVPfCOnqzgfEF5ryl0x",
    "genre": "country",
    "name": "Johnny Cash",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb94a8326675bfcafb20f0a235",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517494a8326675bfcafb20f0a235",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17894a8326675bfcafb20f0a235",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "32vWCbZh0xZ4o9gkz4PsEU",
    "genre": "country",
    "name": "Dolly Parton",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb61aae76c2db6b8645f1553d0",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517461aae76c2db6b8645f1553d0",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17861aae76c2db6b8645f1553d0",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5W5bDNCqJ1jbCgTxDD0Cb3",
    "genre": "country",
    "name": "Willie Nelson",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6772690000c46c82a531f8f5067e13517f5b15",
        "height": 1000,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/ab6772690000dd2282a531f8f5067e13517f5b15",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6772690000bac382a531f8f5067e13517f5b15",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/ab67726900008f7482a531f8f5067e13517f5b15",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "2dyeCWctcFRt3Pha76ONgb",
    "genre": "country",
    "name": "Hank Williams",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebf2335981837c8ac955769cd0",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174f2335981837c8ac955769cd0",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178f2335981837c8ac955769cd0",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7dNsHhGeGU5MV01r06O8gK",
    "genre": "country",
    "name": "Patsy Cline",
    "images": [
      {
        "url": "https://i.scdn.co/image/c8eb3a2d38f77a5f9e752036dec6c21f307fbfe2",
        "height": 1212,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/af95cec911f1efee46dd678af10db119d34599e9",
        "height": 775,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/c3379cb13ce6f096a851843623074ed6e734f53a",
        "height": 242,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/04ecece3439df62906ef357f70e2668c341837d8",
        "height": 78,
        "width": 64
      }
    ]
  },
  {
    "id": "5e4Dhzv426EvQe3aDb64jL",
    "genre": "country",
    "name": "Shania Twain",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb01022f4092cb96e0a91811a5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517401022f4092cb96e0a91811a5",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17801022f4092cb96e0a91811a5",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4tw2Lmn9tTPUv7Gy7mVPI4",
    "genre": "country",
    "name": "Kenny Rogers",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb43eec847b2e3aaa5f4edbd23",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517443eec847b2e3aaa5f4edbd23",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17843eec847b2e3aaa5f4edbd23",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4BclNkZtAUq1YrYNzye3N7",
    "genre": "country",
    "name": "Garth Brooks",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6772690000c46c0e2b77151ee54685fdf75ab5",
        "height": 1000,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/ab6772690000dd220e2b77151ee54685fdf75ab5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6772690000bac30e2b77151ee54685fdf75ab5",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/ab67726900008f740e2b77151ee54685fdf75ab5",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "5vngPClqofybhPERIqQMYd",
    "genre": "country",
    "name": "George Strait",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb77f28b2422efbabde324291c",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517477f28b2422efbabde324291c",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17877f28b2422efbabde324291c",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7wCjDgV6nqBsHguQXPAaIM",
    "genre": "country",
    "name": "Waylon Jennings",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb6e388c7ce238ebd00367f9e6",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051746e388c7ce238ebd00367f9e6",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1786e388c7ce238ebd00367f9e6",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7GaxyUddsPok8BuhxN6OUW",
    "genre": "funk",
    "name": "James Brown",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb158342aa8bb8a192c778f2a5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174158342aa8bb8a192c778f2a5",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178158342aa8bb8a192c778f2a5",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "450o9jw6AtiQlQkHCdH6Ru",
    "genre": "funk",
    "name": "Parliament-Funkadelic",
    "images": [
      {
        "url": "https://i.scdn.co/image/dfd7b11d97bc9159e9d085c5fd925b70cd192178",
        "height": 740,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/62458dad056210b6511d375b8a590ac52d551d3f",
        "height": 474,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/6aeb0becd14d0a37bb63a4885ac6dc69267f17d5",
        "height": 148,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/cde417911c59c87190b352f549f76f99d8bdcb18",
        "height": 47,
        "width": 64
      }
    ]
  },
  {
    "id": "5m8H6zSadhu1j9Yi04VLqD",
    "genre": "funk",
    "name": "Sly & The Family Stone",
    "images": [
      {
        "url": "https://i.scdn.co/image/9aef578389c4a9d27e15a627acb784c41094e79d",
        "height": 1000,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/468e538febbd5553625965bacc8abd5a5e44ed71",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/110d1322a3a6cb7871fa3a326af3040431419f5d",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/36823778c3a58b474d5c3c9407093d25da63390f",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "0FrpdcVlJQqibaz5HfBUrL",
    "genre": "funk",
    "name": "Rick James",
    "images": [
      {
        "url": "https://i.scdn.co/image/e6c035ae9b2a8dd5cf6a3c5f4a0b274d5ff2a605",
        "height": 1145,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/aa4cf47f4d71f91fe70f61bb703f35dc1afeb185",
        "height": 733,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/3ce5793e0e2ab9e3dbc03c1cb23d538c8b86f1b7",
        "height": 229,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/f52762298c22a9c9a82363a96741b726a44c497e",
        "height": 73,
        "width": 64
      }
    ]
  },
  {
    "id": "3VNITwohbvU5Wuy5PC6dsI",
    "genre": "funk",
    "name": "Kool & The Gang",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb69287c3f1b150bbead642499",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517469287c3f1b150bbead642499",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17869287c3f1b150bbead642499",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4QQgXkCYTt3BlENzhyNETg",
    "genre": "funk",
    "name": "Earth, Wind & Fire",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb9722e16a886767adf1178f92",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051749722e16a886767adf1178f92",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1789722e16a886767adf1178f92",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5a2EaR3hamoenG9rDuVn8j",
    "genre": "funk",
    "name": "Prince",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebeaca358712b3fe4ed9814640",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174eaca358712b3fe4ed9814640",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178eaca358712b3fe4ed9814640",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5K0rbdBrs2tNXe5LeWMATT",
    "genre": "funk",
    "name": "Bootsy Collins",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebfa0a1f2170348dc5c3d3ce07",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174fa0a1f2170348dc5c3d3ce07",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178fa0a1f2170348dc5c3d3ce07",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2JRvXPGWiINrnJljNJhG5s",
    "genre": "funk",
    "name": "The Meters",
    "images": [
      {
        "url": "https://i.scdn.co/image/2439ee3f609c4039a544a4505d7294f3240a290d",
        "height": 562,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/126f45bb09f1174ff5a44c986e3b00c33e5a0d5d",
        "height": 360,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/3720bab80224913c5c0ddb991a01148ef9b6b0da",
        "height": 112,
        "width": 199
      },
      {
        "url": "https://i.scdn.co/image/e045177813c9d1784000d16b6a8a98fb598bb8e7",
        "height": 36,
        "width": 64
      }
    ]
  },
  {
    "id": "0JCxGVxsISZzJHJPUOtceB",
    "genre": "funk",
    "name": "Tower of Power",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebc5f43e823cc1ce2a8d6fb732",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174c5f43e823cc1ce2a8d6fb732",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178c5f43e823cc1ce2a8d6fb732",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2eogQKWWoohI3BSnoG7E2U",
    "genre": "disco",
    "name": "Donna Summer",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb9e708b5a9b76b98301d35123",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051749e708b5a9b76b98301d35123",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1789e708b5a9b76b98301d35123",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1LZEQNv7sE11VDY3SdxQeN",
    "genre": "disco",
    "name": "Bee Gees",
    "images": [
      {
        "url": "https://i.scdn.co/image/1d5a05673975ba0c378cd280344e000b0b865620",
        "height": 733,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/1ea4795e17ffa658d7ad23095d58997a278179a9",
        "height": 469,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/1f363042bdd59e0f80cb7b9cac1b312f9389b019",
        "height": 147,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/c707552215757c7f2dc6071e32d487a3c7b28d3f",
        "height": 47,
        "width": 64
      }
    ]
  },
  {
    "id": "0Xf8oDAJYd2D0k3NLI19OV",
    "genre": "disco",
    "name": "Chic",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb4c74c17081e7e0ef8b5eb323",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051744c74c17081e7e0ef8b5eb323",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1784c74c17081e7e0ef8b5eb323",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6V6WCgi7waF55bJmylC4H5",
    "genre": "disco",
    "name": "Gloria Gaynor",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebb75ca1c0223fc450dfe3c1ec",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174b75ca1c0223fc450dfe3c1ec",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178b75ca1c0223fc450dfe3c1ec",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3mQBpAOMWYqAZyxtyeo4Lo",
    "genre": "disco",
    "name": "KC and the Sunshine Band",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb5b9b91f430a06b8094efcbda",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051745b9b91f430a06b8094efcbda",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1785b9b91f430a06b8094efcbda",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "5TGTpu4g8siFOIctZuQO7y",
    "genre": "disco",
    "name": "Sylvester",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb224edfd4e7b8101c4d217134",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174224edfd4e7b8101c4d217134",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178224edfd4e7b8101c4d217134",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0dCKce6tJJdHvlWnDMwzPW",
    "genre": "disco",
    "name": "The Village People",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb60571cd7326957308bad6380",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517460571cd7326957308bad6380",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17860571cd7326957308bad6380",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3MdG05syQeRYPPcClLaUGl",
    "genre": "disco",
    "name": "Diana Ross",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebdb59e1c017a93648b119f0cc",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174db59e1c017a93648b119f0cc",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178db59e1c017a93648b119f0cc",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6gkWznnJkdkwRPVcmnrays",
    "genre": "disco",
    "name": "Sister Sledge",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb3e3e634435f477df50760eae",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051743e3e634435f477df50760eae",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1783e3e634435f477df50760eae",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "54R6Y0I7jGUCveDTtI21nb",
    "genre": "disco",
    "name": "Boney M.",
    "images": [
      {
        "url": "https://i.scdn.co/image/94f8fa49e6ac6748393ff020567c9b95c7f48c18",
        "height": 707,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/524d6cfd6530ec5ed5a543b86840f99e631c5478",
        "height": 452,
        "width": 639
      },
      {
        "url": "https://i.scdn.co/image/8e3525b09dc042057b46a19ac3641d347226a9a6",
        "height": 141,
        "width": 199
      },
      {
        "url": "https://i.scdn.co/image/d85dce165e3ee3ccf8ffcdaa533d39373463142a",
        "height": 45,
        "width": 64
      }
    ]
  },
  {
    "id": "63yl9nDNrHpiAYGlNJxxjc",
    "genre": "house",
    "name": "Frankie Knuckles",
    "images": [
      {
        "url": "https://i.scdn.co/image/4430135715f2686c6ae65659dfac40472182c717",
        "height": 707,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/7e895d1634865f4e3eba99ac1ce6ffeb036b7cac",
        "height": 452,
        "width": 639
      },
      {
        "url": "https://i.scdn.co/image/5bbfbe4b254c5d2a0efd57ebe0ed615755857ed0",
        "height": 141,
        "width": 199
      },
      {
        "url": "https://i.scdn.co/image/a266245c1f16dd720c5336e073caddbf7c8a130f",
        "height": 45,
        "width": 64
      }
    ]
  },
  {
    "id": "3j7teie3p6UnbA8nW51Trz",
    "genre": "house",
    "name": "Larry Heard",
    "images": [
      {
        "url": "https://i.scdn.co/image/29dd50d9a51002524ea2354c9fed0b5ec34b8ae6",
        "height": 408,
        "width": 600
      },
      {
        "url": "https://i.scdn.co/image/e6319a032b80971f9ad197ffbaf9763375510907",
        "height": 136,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/6102c4e90dc6709babf9c0452a92f43a1293aaf9",
        "height": 44,
        "width": 64
      }
    ]
  },
  {
    "id": "2Di8r9df6xjyj6CVOqbGVz",
    "genre": "house",
    "name": "Marshall Jefferson",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb3134a7107ee71716b7ea61d5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051743134a7107ee71716b7ea61d5",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1783134a7107ee71716b7ea61d5",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4tZwfgrHOc3mvqYlEYSvVi",
    "genre": "house",
    "name": "Daft Punk",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eba7bfd7835b5c1eee0c95fa6e",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174a7bfd7835b5c1eee0c95fa6e",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178a7bfd7835b5c1eee0c95fa6e",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1Cs0zKBU1kc0i8ypK3B9ai",
    "genre": "house",
    "name": "David Guetta",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebf150017ca69c8793503c2d4f",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174f150017ca69c8793503c2d4f",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178f150017ca69c8793503c2d4f",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3cQA9WH8liZfeja1DxcDYE",
    "genre": "house",
    "name": "Armand Van Helden",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebb22d49b871ccbfa4b31331e8",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174b22d49b871ccbfa4b31331e8",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178b22d49b871ccbfa4b31331e8",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "77AiFEVeAVj2ORpC85QVJs",
    "genre": "house",
    "name": "Steve Aoki",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebcf85b39d94c486218a687248",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174cf85b39d94c486218a687248",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178cf85b39d94c486218a687248",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2XnBwblw31dfGnspMIwgWz",
    "genre": "house",
    "name": "Axwell & Ingrosso",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb9f6e5d736809c4cb40d59a7e",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051749f6e5d736809c4cb40d59a7e",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1789f6e5d736809c4cb40d59a7e",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1vCWHaC5f2uS3yhpwWbIA6",
    "genre": "house",
    "name": "Avicii",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebae07171f989fb39736674113",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174ae07171f989fb39736674113",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178ae07171f989fb39736674113",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6TQj5BFPooTa08A7pk8AQ1",
    "genre": "house",
    "name": "Kaskade",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebc96f32c30b4c236b5b9c40fa",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174c96f32c30b4c236b5b9c40fa",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178c96f32c30b4c236b5b9c40fa",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "208EQzx7RmoE2Ng9gF2edh",
    "genre": "techno",
    "name": "Juan Atkins",
    "images": [
      {
        "url": "https://i.scdn.co/image/8527b7857c3ae715260cec0cdc72910d1d5deb63",
        "height": 667,
        "width": 999
      },
      {
        "url": "https://i.scdn.co/image/0b9b5ad01f6c69a9a5be951ce378f38dd0208db3",
        "height": 427,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/561500450c581669344ac26cae47cf9fdcfd7bdf",
        "height": 133,
        "width": 199
      },
      {
        "url": "https://i.scdn.co/image/6a5acf908478c6496a12bbe5b9efb3441a777db4",
        "height": 43,
        "width": 64
      }
    ]
  },
  {
    "id": "0v6N0xV7AfHHKVcgUOjC51",
    "genre": "techno",
    "name": "Derrick May",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb7ca301a140785ca26b9a6b31",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051747ca301a140785ca26b9a6b31",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1787ca301a140785ca26b9a6b31",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0jS6VTFGujWxinY5TSQwOG",
    "genre": "techno",
    "name": "Kevin Saunderson",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb85641acf4b0c40abe470ff13",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517485641acf4b0c40abe470ff13",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17885641acf4b0c40abe470ff13",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "19SmlbABtI4bXz864MLqOS",
    "genre": "techno",
    "name": "Carl Cox",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb6c21953cc4157aa2f4627ff3",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051746c21953cc4157aa2f4627ff3",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1786c21953cc4157aa2f4627ff3",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2eIDAcLKnWc4D350YyzvgS",
    "genre": "techno",
    "name": "Jeff Mills",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6772690000c46c845ce16f4bb6686023eb3250",
        "height": 1000,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/ab6772690000dd22845ce16f4bb6686023eb3250",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6772690000bac3845ce16f4bb6686023eb3250",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/ab67726900008f74845ce16f4bb6686023eb3250",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "3AhwIUus3pIaA3CvYBEtpy",
    "genre": "techno",
    "name": "Richie Hawtin",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb0da1de5df15aa99d71bc439a",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051740da1de5df15aa99d71bc439a",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1780da1de5df15aa99d71bc439a",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3OsRAKCvk37zwYcnzRf5XF",
    "genre": "techno",
    "name": "Moby",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb85e8c6cc75e2810460c84564",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517485e8c6cc75e2810460c84564",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17885e8c6cc75e2810460c84564",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4k1ELeJKT1ISyDv8JivPpB",
    "genre": "techno",
    "name": "The Prodigy",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb147841812056c247407811f3",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174147841812056c247407811f3",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178147841812056c247407811f3",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1PXHzxRDiLnjqNrRn2Xbsa",
    "genre": "techno",
    "name": "Underworld",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb5cfa742c32b2f8c23f94cf7e",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051745cfa742c32b2f8c23f94cf7e",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1785cfa742c32b2f8c23f94cf7e",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3y1SoTOdrmRNTBVph5T0VZ",
    "genre": "techno",
    "name": "Laurent Garnier",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb510d9e62eef3ac2b75249628",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174510d9e62eef3ac2b75249628",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178510d9e62eef3ac2b75249628",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1RyvyyTE3xzB2ZywiAwp0i",
    "genre": "trap",
    "name": "Future",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb7565b356bc9d9394eefa2ccb",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051747565b356bc9d9394eefa2ccb",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1787565b356bc9d9394eefa2ccb",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "13y7CgLHjMVRMDqxdx0Xdo",
    "genre": "trap",
    "name": "Gucci Mane",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebb9b77f64bd278ffde2c94428",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174b9b77f64bd278ffde2c94428",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178b9b77f64bd278ffde2c94428",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "50co4Is1HCEo8bhOyUWKpn",
    "genre": "trap",
    "name": "Young Thug",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb3526c8e811f828c10fa4dd90",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051743526c8e811f828c10fa4dd90",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1783526c8e811f828c10fa4dd90",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6oMuImdp5ZcFhWP0ESe6mG",
    "genre": "trap",
    "name": "Migos",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebf4593f7b778219838d858c34",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174f4593f7b778219838d858c34",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178f4593f7b778219838d858c34",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0Y5tJX1MQlPlqiwlOH1tJY",
    "genre": "trap",
    "name": "Travis Scott",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb19c2790744c792d05570bb71",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517419c2790744c792d05570bb71",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17819c2790744c792d05570bb71",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1URnnhqYAYcrqrcwql10ft",
    "genre": "trap",
    "name": "21 Savage",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb4f8f76117470957c0e81e5b2",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051744f8f76117470957c0e81e5b2",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1784f8f76117470957c0e81e5b2",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4O15NlyKLIASxsJ0PrXPfz",
    "genre": "trap",
    "name": "Lil Uzi Vert",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eba8ce348f34f18241d3249fa9",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174a8ce348f34f18241d3249fa9",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178a8ce348f34f18241d3249fa9",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "699OTQXzgjhIYAHMy9RyPD",
    "genre": "trap",
    "name": "Playboi Carti",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebba50ca67ffc3097f6ea1710a",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174ba50ca67ffc3097f6ea1710a",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178ba50ca67ffc3097f6ea1710a",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "15iVAtD3s3FsQR4w1v6M0P",
    "genre": "trap",
    "name": "Chief Keef",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebf3d48b48b4603bd55f489655",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174f3d48b48b4603bd55f489655",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178f3d48b48b4603bd55f489655",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0iEtIxbK0KxaSlF7G42ZOp",
    "genre": "trap",
    "name": "Metro Boomin",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebdf9a1555f53a20087b8c5a5c",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174df9a1555f53a20087b8c5a5c",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178df9a1555f53a20087b8c5a5c",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3Nrfpe0tUJi4K4DXYWgMUX",
    "genre": "k-pop",
    "name": "BTS",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebd642648235ebf3460d2d1f6a",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174d642648235ebf3460d2d1f6a",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178d642648235ebf3460d2d1f6a",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "41MozSoPIsD1dJM0CLPjZF",
    "genre": "k-pop",
    "name": "BLACKPINK",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb667b1c37aac06716daa5fe92",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174667b1c37aac06716daa5fe92",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178667b1c37aac06716daa5fe92",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3cjEqqelV9zb4BYE3qDQ4O",
    "genre": "k-pop",
    "name": "EXO",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebaf3c4b988a6fef40843cdc83",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174af3c4b988a6fef40843cdc83",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178af3c4b988a6fef40843cdc83",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4Kxlr1PRlDKEB0ekOCyHgX",
    "genre": "k-pop",
    "name": "BIGBANG",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb597a4257d0022e2ac837fa7d",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174597a4257d0022e2ac837fa7d",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178597a4257d0022e2ac837fa7d",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7n2Ycct7Beij7Dj7meI4X0",
    "genre": "k-pop",
    "name": "TWICE",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebca6c145421fa9ceb58d6f9d4",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174ca6c145421fa9ceb58d6f9d4",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178ca6c145421fa9ceb58d6f9d4",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2dIgFjalVxs4ThymZ67YCE",
    "genre": "k-pop",
    "name": "Stray Kids",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebdbe356bad5c3576e77dbf36f",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174dbe356bad5c3576e77dbf36f",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178dbe356bad5c3576e77dbf36f",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1z4g3DjTBBZKhvAroFlhOM",
    "genre": "k-pop",
    "name": "Red Velvet",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb02a562ea6b1dc718394010ac",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517402a562ea6b1dc718394010ac",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17802a562ea6b1dc718394010ac",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7nqOGRxlXj7N2JYbgNEjYH",
    "genre": "k-pop",
    "name": "SEVENTEEN",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb8912a840e637dacc0d5c7828",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051748912a840e637dacc0d5c7828",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1788912a840e637dacc0d5c7828",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7f4ignuCJhLXfZ9giKT7rH",
    "genre": "k-pop",
    "name": "NCT",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebdc904dcc7399f1fd90107392",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174dc904dcc7399f1fd90107392",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178dc904dcc7399f1fd90107392",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6gzXCdfYfFe5XKhPKkYqxV",
    "genre": "k-pop",
    "name": "Super Junior",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb723b8c26c6f79257c4f832e3",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174723b8c26c6f79257c4f832e3",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178723b8c26c6f79257c4f832e3",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0EmeFodog0BfCgMzAIvKQp",
    "genre": "latin",
    "name": "Shakira",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb2528c726e5ddb90a7197e527",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051742528c726e5ddb90a7197e527",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1782528c726e5ddb90a7197e527",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7slfeZO9LsJbWgpkIoXBUJ",
    "genre": "latin",
    "name": "Ricky Martin",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb1c0f358293ec7b223fd91fca",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051741c0f358293ec7b223fd91fca",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1781c0f358293ec7b223fd91fca",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2weA6hhVqTIN2gSn9PUB9U",
    "genre": "latin",
    "name": "Celia Cruz",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebb58cbc73f2b755f60134c54b",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174b58cbc73f2b755f60134c54b",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178b58cbc73f2b755f60134c54b",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2MRBDr0crHWE5JwPceFncq",
    "genre": "latin",
    "name": "Juan Gabriel",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb41b8c9e933cb0ea8ea8b68ed",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517441b8c9e933cb0ea8ea8b68ed",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17841b8c9e933cb0ea8ea8b68ed",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4wLXwxDeWQ8mtUIRPxGiD6",
    "genre": "latin",
    "name": "Marc Anthony",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb036b6cb012fd1c34862161c2",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174036b6cb012fd1c34862161c2",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178036b6cb012fd1c34862161c2",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4q3ewBCX7sLwd24euuV69X",
    "genre": "latin",
    "name": "Bad Bunny",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb81f47f44084e0a09b5f0fa13",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517481f47f44084e0a09b5f0fa13",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17881f47f44084e0a09b5f0fa13",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4VMYDCV2IEDYJArk749S6m",
    "genre": "latin",
    "name": "Daddy Yankee",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb99a6ccc4aae5ae5404c9eb30",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517499a6ccc4aae5ae5404c9eb30",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17899a6ccc4aae5ae5404c9eb30",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0C8ZW7ezQVs4URX5aX7Kqx",
    "genre": "latin",
    "name": "Selena",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb815e520e3ce7fe210046ba66",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174815e520e3ce7fe210046ba66",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178815e520e3ce7fe210046ba66",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7okwEbXzyT2VffBmyQBWLz",
    "genre": "latin",
    "name": "Maná",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb152dcec8175d19fb12eeb8e0",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174152dcec8175d19fb12eeb8e0",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178152dcec8175d19fb12eeb8e0",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6GI52t8N5F02MxU0g5U69P",
    "genre": "latin",
    "name": "Carlos Santana",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb09882b1b7b33732abd60fc38",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517409882b1b7b33732abd60fc38",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17809882b1b7b33732abd60fc38",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6olE6TJLqED3rqDCT0FyPh",
    "genre": "alternative",
    "name": "Nirvana",
    "images": [
      {
        "url": "https://i.scdn.co/image/84282c28d851a700132356381fcfbadc67ff498b",
        "height": 1057,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/a4e10b79a642e9891383448cbf37d7266a6883d6",
        "height": 677,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/42ae0f180f16e2f21c1f2212717fc436f5b95451",
        "height": 211,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/e797ad36d56c3fc8fa06c6fe91263a15bf8391b8",
        "height": 68,
        "width": 64
      }
    ]
  },
  {
    "id": "4Z8W4fKeB5YxbusRsdQVPb",
    "genre": "alternative",
    "name": "Radiohead",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eba03696716c9ee605006047fd",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174a03696716c9ee605006047fd",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178a03696716c9ee605006047fd",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1w5Kfo2jwwIPruYS2UWh56",
    "genre": "alternative",
    "name": "Pearl Jam",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebe431fb8ba17cdee73e4ce08a",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174e431fb8ba17cdee73e4ce08a",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178e431fb8ba17cdee73e4ce08a",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "40Yq4vzPs9VNUrIBG5Jr2i",
    "genre": "alternative",
    "name": "The Smashing Pumpkins",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb86bd93938c4811d1f94adf9f",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517486bd93938c4811d1f94adf9f",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17886bd93938c4811d1f94adf9f",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4KWTAlx2RvbpseOGMEmROg",
    "genre": "alternative",
    "name": "R.E.M.",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb6334ab6a83196f36475ada7f",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051746334ab6a83196f36475ada7f",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1786334ab6a83196f36475ada7f",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7jy3rLJdDQY21OgRLCZ9sD",
    "genre": "alternative",
    "name": "Foo Fighters",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebc884df599abc793c116cdf15",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174c884df599abc793c116cdf15",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178c884df599abc793c116cdf15",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7bu3H8JO7d0UbMoVzbo70s",
    "genre": "alternative",
    "name": "The Cure",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebdd427c765c409ec02dc3a868",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174dd427c765c409ec02dc3a868",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178dd427c765c409ec02dc3a868",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "0L8ExT028jH3ddEcZwqJJ5",
    "genre": "alternative",
    "name": "Red Hot Chili Peppers",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebc33cc15260b767ddec982ce8",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174c33cc15260b767ddec982ce8",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178c33cc15260b767ddec982ce8",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "4obzFoKoKRHIphyHzJ35G3",
    "genre": "alternative",
    "name": "Beck",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb689f28b643fd40a523e00a96",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174689f28b643fd40a523e00a96",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178689f28b643fd40a523e00a96",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "12Chz98pHFMPJEknJQMWvI",
    "genre": "alternative",
    "name": "Muse",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb0accbbe13e1aa147dd27671c",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051740accbbe13e1aa147dd27671c",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1780accbbe13e1aa147dd27671c",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "7MSUfLeTdDEoZiJPDSBXgi",
    "genre": "ambient",
    "name": "Brian Eno",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb5533ce5711f95f0c436b30fe",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051745533ce5711f95f0c436b30fe",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1785533ce5711f95f0c436b30fe",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6kBDZFXuLrZgHnvmPu9NsG",
    "genre": "ambient",
    "name": "Aphex Twin",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebaa3c91d792eb520a5d58daa5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174aa3c91d792eb520a5d58daa5",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178aa3c91d792eb520a5d58daa5",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "3OsRAKCvk37zwYcnzRf5XF",
    "genre": "ambient",
    "name": "Moby",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb85e8c6cc75e2810460c84564",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517485e8c6cc75e2810460c84564",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17885e8c6cc75e2810460c84564",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "2VAvhf61GgLYmC6C8anyX1",
    "genre": "ambient",
    "name": "Boards of Canada",
    "images": [
      {
        "url": "https://i.scdn.co/image/c533bf6f08a42119065d8c2171cdfa8e96720b4c",
        "height": 902,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/c0b33a8d211600d70dcda3077d6a582da34321b0",
        "height": 578,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/cefe6c830485f48e0d14c9c779d7bd61c8852161",
        "height": 180,
        "width": 199
      },
      {
        "url": "https://i.scdn.co/image/d178796bb8003ec506629e0e63939599cbaba85c",
        "height": 58,
        "width": 64
      }
    ]
  },
  {
    "id": "6u5axd0rpDsWSmzhFfb2VB",
    "genre": "ambient",
    "name": "William Basinski",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6772690000c46cbe9041c25def0efe8dec6ec5",
        "height": 1000,
        "width": 1000
      },
      {
        "url": "https://i.scdn.co/image/ab6772690000dd22be9041c25def0efe8dec6ec5",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6772690000bac3be9041c25def0efe8dec6ec5",
        "height": 200,
        "width": 200
      },
      {
        "url": "https://i.scdn.co/image/ab67726900008f74be9041c25def0efe8dec6ec5",
        "height": 64,
        "width": 64
      }
    ]
  },
  {
    "id": "1BGN1IdyiSR0ZYrkoKNchl",
    "genre": "ambient",
    "name": "Tangerine Dream",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb9b94355f06250928e4e4ead0",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051749b94355f06250928e4e4ead0",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1789b94355f06250928e4e4ead0",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "00gh6kmKYOu8xyorRxQm6a",
    "genre": "ambient",
    "name": "Steve Roach",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb58c878cd7922fc25a2ff81ad",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000517458c878cd7922fc25a2ff81ad",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f17858c878cd7922fc25a2ff81ad",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "36pCa1JHc6hlGbfEmLzJQc",
    "genre": "ambient",
    "name": "Stars of the Lid",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb4cd47defce818236e875e8df",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051744cd47defce818236e875e8df",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1784cd47defce818236e875e8df",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "1qiwaJwjKod5WhcYZ76O1B",
    "genre": "ambient",
    "name": "Tim Hecker",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5ebcd1bb3562720521214eb29d1",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab67616100005174cd1bb3562720521214eb29d1",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f178cd1bb3562720521214eb29d1",
        "height": 160,
        "width": 160
      }
    ]
  },
  {
    "id": "6UUrUCIZtQeOf8tC0WuzRy",
    "genre": "ambient",
    "name": "Sigur Rós",
    "images": [
      {
        "url": "https://i.scdn.co/image/ab6761610000e5eb6e9247ebb1bd90c23fb776fc",
        "height": 640,
        "width": 640
      },
      {
        "url": "https://i.scdn.co/image/ab676161000051746e9247ebb1bd90c23fb776fc",
        "height": 320,
        "width": 320
      },
      {
        "url": "https://i.scdn.co/image/ab6761610000f1786e9247ebb1bd90c23fb776fc",
        "height": 160,
        "width": 160
      }
    ]
  }
];

// Fonction qui retourne un mix artistes Spotify + statique (sans doublons)
async function getMixedArtistsByGenre(genre) {
  const spotifyArtists = await getPopularArtistsByGenre(genre);
  // Filtre la liste statique pour ne garder que les artistes du genre demandé
  const staticArtists = STATIC_ARTISTS.filter(a => a.genre && a.genre.toLowerCase() === genre.toLowerCase());
  // Fusionne et supprime les doublons par nom (ou id)
  const allArtists = [...staticArtists, ...spotifyArtists];
  const uniqueArtists = Array.from(
    new Map(allArtists.map(a => [a.name.toLowerCase(), a])).values()
  );
  return uniqueArtists;
}

module.exports = { searchSpotifyTracks, getPopularArtistsByGenre, getMixedArtistsByGenre };