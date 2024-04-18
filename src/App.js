import { useState, createContext, useContext } from 'react';
import './App.css';
import currencies from './currencies.js';
import Plus from './plus.png';
import Minus from './minus.png';

const FuncContext = createContext(null);

const defA = [0, "RUB", "USD"];
const defB = [0, "RUB", "EUR"];

function App() {
  const [menuList, setMenuList] = useState([defA, defB]);
  
  function onInputChange( index, key, val) {
    
    const newList = menuList.map((list, i) => {
            if (i !== index) {
              return list;
            } else return list.map((l, i) => {
              if (i !== key) {
                return l
               } else {
                return val
              }
            })
    })
    setMenuList(newList);
  }

  function addClick() {
    const addlist = [0, "RUB", "RUB"];
    setMenuList([...menuList, addlist]);
  }
  function deleteClick(index) {
    const newlist = menuList.filter((menu, i) => i !== index);
    setMenuList(newlist);
  }
  
  return (
    <FuncContext.Provider value={onInputChange}>
      <div className="container">
      {menuList.map((menu, index) => {
        return (
          <div className="lineBlock" key={index}>
          <Delete func={() => deleteClick(index)}/>
          <Menu  index={index} amount={menu[0]} 
          from={menu[1]} to={menu[2]} />{index === menuList.length - 1 && 
          <Adder func={addClick}/>}</div>
        )
      })}
      
    </div>
    </FuncContext.Provider>
  );
}

function Adder({func}) {
  return (
    <button onClick={func} className="adder" >
      <img src={Plus}></img>
         
    </button>
  )
}

function Delete({func}) {
  return (
    <button onClick={func} className="minus">
      <img src={Minus}></img>
    </button>
  )
}



function Player( {index, from, to} ) {
  const onInput = useContext(FuncContext);
  const vektor = from ? 1 : 2;
  
  return (
    <div className="block">
      <label htmlFor="text">{from ? "From" : "To"}</label>
      <br></br>
      <div className="input-wrapper">
        <input onChange={(e) => onInput(index, vektor, e.target.value)} value={from || to}
        id="text" type="text" autoComplete="off"></input>
      </div>
      </div>
   )
}



function Amount({index, amount}) {
  
  const onInput = useContext(FuncContext);
  
  return (
    <div  className="block">
      <label htmlFor="text">Amount</label><div className="input-wrapper">
        <input onChange={(e) => onInput(index, 0, e.target.value)} value={amount}
        id="text" type="text" autoComplete="off"></input>
      </div>
      </div>
   )

}

function Menu({from, to, amount, index }) {
  const [show, setShow] = useState(false);
  const [num, setNum] = useState(0);
  function letCaclculate(e) {
       e.preventDefault();
       setShow(!show);
       startChange(!show);
      
      
  }
  
  function startChange(toShow) {
    
    exchange(from, to).then(res => {
      setNum(res * amount);
      
      
     })
  }
  return (
    <div className="calculate">
    <form action="" onSubmit={letCaclculate}>
      <div className="menu" >
      
        <Amount amount={amount} index={index}/>
      
          <Player from={from} index={index}/>
      
      
        <Player to={to} index={index}/>
      </div>
      <div className="interAction">
        {show && <Result num={num} kind={to}/>} {<button type="submit" className="calcButton">
        {!show ? 'Calculate' : 'Hide'}</button>}
        {show && <button  onClick={() => startChange(true)} className="calcButton">
        Calculate</button>}
      </div>
    </form>
    </div>
  )
}

function Result({num, kind}) {
  return (
    <div className="result">
      {num} {kind}

    </div>
  )
}

async function exchange(from, to) {
  const res = await fetch(`https://v6.exchangerate-api.com/v6/4f9059fdd169d7383a8a6367/latest/${from}`);
  const json = await res.json();
  const result = json.conversion_rates[to];
  return result;
}

export default App;
