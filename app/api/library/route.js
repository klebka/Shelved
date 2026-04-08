export async function GET(request){
    const {searchParams} = new URL(request.url)
    const steamid = searchParams.get('steamid')

    if(!steamid){
        return Response.json({error: 'Missing steamid parameter'}, {status: 400})
    }

    const apiKey = process.env.STEAM_API_KEY
    const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamid}&include_appinfo=true&include_played_free_games=true`

    try{
        const res = await fetch(url)
        const data = await res.json()

        if(!data.response || !data.response.games){
            return Response.json({error: 'No games found. Profile may be private.'}, {status: 404})
        }

        return Response.json(data.response.games)
    }
    catch(error){
        return Response.json({error: 'Failed to fetch from Steam'}, {status: 500})
    }
}