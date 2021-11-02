let rahul =()=>{
  const data={
    name:"rahul",
    age:23,
    surname:"sharma"
  }
  let p = new Promise((resolve,reject)=>{
    if (data.name=='rahul'){
      resolve(data)
    }
    else{reject('error')}
  })
  return p
}

rahul()
.then((mydata)=> console.log(mydata)
)
.catch((error)=>console.log(error)
)
