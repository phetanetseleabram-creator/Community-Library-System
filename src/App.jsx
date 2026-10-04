import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import "./index.css";

const seedBooks = [
  {id:1,title:"Things Fall Apart",author:"Chinua Achebe",genre:"Fiction",isbn:"9780385474542",qty:3},
  {id:2,title:"Clean Code",author:"Robert Martin",genre:"Technology",isbn:"9780132350884",qty:1}
];
const seedUsers = [{id:1,name:"Admin",membership:"ADM001",role:"Admin"}];

const get = (key, fallback) => JSON.parse(localStorage.getItem(key)) || fallback;
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function Layout({children}) {
  return <><header><h2>Community Library</h2><nav>
    <Link to="/">Dashboard</Link><Link to="/books">Books</Link>
    <Link to="/transactions">Transactions</Link><Link to="/users">Users</Link>
  </nav></header><main>{children}</main></>;
}

function Dashboard() {
  const [books,setBooks] = useState([]);
  useEffect(()=>setBooks(get("books",seedBooks)),[]);
  return <section><h1>Dashboard</h1><p>Current book availability</p>
    <table><thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>Stock</th></tr></thead>
    <tbody>{books.map(b=><tr className={b.qty<2?"low":""} key={b.id}>
      <td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td><td>{b.qty}</td>
    </tr>)}</tbody></table>
    <p className="note">Books with fewer than 2 copies are highlighted.</p>
  </section>;
}

function Books() {
  const [books,setBooks] = useState(()=>get("books",seedBooks));
  const blank={title:"",author:"",genre:"",isbn:"",qty:1};
  const [form,setForm]=useState(blank), [edit,setEdit]=useState(null);
  const change=e=>setForm({...form,[e.target.name]:e.target.name==="qty"?Number(e.target.value):e.target.value});
  const submit=e=>{
    e.preventDefault();
    if(!form.title||!form.author||!form.isbn) return alert("Please fill the required fields.");
    const list=edit?books.map(b=>b.id===edit?{...form,id:edit}:b):[...books,{...form,id:Date.now()}];
    setBooks(list); save("books",list); setForm(blank); setEdit(null);
  };
  const update=b=>{setEdit(b.id);setForm(b)};
  const remove=id=>{const list=books.filter(b=>b.id!==id);setBooks(list);save("books",list)};
  return <section><h1>Book Management</h1>
    <form onSubmit={submit} className="form">
      <input name="title" placeholder="Title" value={form.title} onChange={change}/>
      <input name="author" placeholder="Author" value={form.author} onChange={change}/>
      <input name="genre" placeholder="Genre" value={form.genre} onChange={change}/>
      <input name="isbn" placeholder="ISBN" value={form.isbn} onChange={change}/>
      <input name="qty" type="number" min="0" placeholder="Quantity" value={form.qty} onChange={change}/>
      <button>{edit?"Update Book":"Add Book"}</button>
    </form>
    <table><thead><tr><th>Title</th><th>Author</th><th>ISBN</th><th>Qty</th><th>Actions</th></tr></thead>
    <tbody>{books.map(b=><tr key={b.id}><td>{b.title}</td><td>{b.author}</td><td>{b.isbn}</td><td>{b.qty}</td>
      <td><button onClick={()=>update(b)}>Update</button> <button onClick={()=>remove(b.id)}>Delete</button></td></tr>)}</tbody></table>
  </section>;
}

function Transactions() {
  const [books,setBooks]=useState(()=>get("books",seedBooks));
  const [history,setHistory]=useState(()=>get("transactions",[]));
  const change=(id,amount,type)=>{
    const book=books.find(b=>b.id===id);
    if(type==="borrow" && book.qty<1) return alert("No copies available.");
    const list=books.map(b=>b.id===id?{...b,qty:b.qty+amount}:b);
    const item={id:Date.now(),book:book.title,type,amount,date:new Date().toLocaleString()};
    const h=[item,...history]; setBooks(list);setHistory(h);save("books",list);save("transactions",h);
  };
  return <section><h1>Transactions</h1>
    {books.map(b=><div className="row" key={b.id}><b>{b.title}</b><span>Stock: {b.qty}</span>
      <button onClick={()=>change(b.id,1,"stock added")}>Add Stock</button>
      <button onClick={()=>change(b.id,-1,"borrowed")}>Borrow</button></div>)}
    <h3>Transaction History</h3>
    <table><thead><tr><th>Book</th><th>Action</th><th>Amount</th><th>Date</th></tr></thead>
    <tbody>{history.map(x=><tr key={x.id}><td>{x.book}</td><td>{x.type}</td><td>{x.amount}</td><td>{x.date}</td></tr>)}</tbody></table>
  </section>;
}

function Users() {
  const [users,setUsers]=useState(()=>get("users",seedUsers));
  const [form,setForm]=useState({name:"",membership:"",role:"Member"}), [edit,setEdit]=useState(null);
  const [logged,setLogged]=useState(false), nav=useNavigate();
  const submit=e=>{
    e.preventDefault();
    if(!form.name||!form.membership)return;
    const list=edit?users.map(u=>u.id===edit?{...form,id:edit}:u):[...users,{...form,id:Date.now()}];
    setUsers(list);save("users",list);setForm({name:"",membership:"",role:"Member"});setEdit(null);
  };
  const remove=id=>{const list=users.filter(u=>u.id!==id);setUsers(list);save("users",list)};
  if(!logged) return <section className="login"><h1>Library Login</h1>
    <input placeholder="Membership ID" id="loginId"/><button onClick={()=>{
      const id=document.getElementById("loginId").value;
      if(users.some(u=>u.membership===id)){setLogged(true);nav("/users")}else alert("User not found.");
    }}>Login</button><p>Try: ADM001</p></section>;
  return <section><h1>User Management</h1>
    <form onSubmit={submit} className="form">
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
      <input placeholder="Membership ID" value={form.membership} onChange={e=>setForm({...form,membership:e.target.value})}/>
      <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option>Member</option><option>Admin</option></select>
      <button>{edit?"Update User":"Add User"}</button>
    </form>
    <table><thead><tr><th>Name</th><th>Membership</th><th>Role</th><th>Actions</th></tr></thead>
    <tbody>{users.map(u=><tr key={u.id}><td>{u.name}</td><td>{u.membership}</td><td>{u.role}</td>
      <td><button onClick={()=>{setEdit(u.id);setForm(u)}}>Update</button> <button onClick={()=>remove(u.id)}>Delete</button></td></tr>)}</tbody></table>
  </section>;
}

function App(){
  return <BrowserRouter><Layout><Routes>
    <Route path="/" element={<Dashboard/>}/><Route path="/books" element={<Books/>}/>
    <Route path="/transactions" element={<Transactions/>}/><Route path="/users" element={<Users/>}/>
  </Routes></Layout></BrowserRouter>;
}
export default App;
