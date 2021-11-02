
document.getElementById("gettweet").addEventListener("click",async ()=>{
    let x= document.getElementById("gettweetinput").value
    var url = new URL("http://localhost:3000/recent_tweets"),
    params = {twitter_screen_name:x}
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    // console.log(url)
    // let data =await fetch(url)
    // let y= await data.json()
    // console.log(y)
    location.href=url

    
})

document.getElementById('gettweetid').addEventListener('click',()=>{
    let value=document.getElementById('gettweetidinput').value
    let url = new URL("http://localhost:3000/tweet"),
    params={id:value}
    Object.keys(params).forEach(key=>url.searchParams.append(key,params[key]))
    location.href=url
})
document.getElementById('recentliked').addEventListener('click',async ()=>{
    location.href="http://localhost:3000/fav_list"
})


document.getElementById('tweetid').addEventListener('click',async ()=>{
    let value=document.getElementById('tweetidinput').value
    let senddata={tweet_id:value}
    try {
         let data=await fetch("http://localhost:3000/post_favorites",{
                        method:'POST',
                        headers:{'Content-Type':"application/json" },
                        body:JSON.stringify(senddata)
    })
        let processeddata= await data.json()
        console.log(processeddata)
        alert("tweet liked")
    } catch (error) {
        alert("already liked")
    }
    
    

})


document.getElementById('posttweet').addEventListener('click',async ()=>{
    console.log("i got clicked")
    let value=document.getElementById('posttweetinput').value
    let senddata= {actual_tweet:value}
    let data=await fetch("http://localhost:3000/post_tweet",{
        method:'POST',
        headers:{
            'Content-Type':"application/json",
        },
        body:JSON.stringify(senddata)
    }).then((response)=>{
        alert('Tweet posted successfully!!!')
    })
})