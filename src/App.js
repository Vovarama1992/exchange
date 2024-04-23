import { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import currencies from './currencies.js';
import Plus from './plus.png';
import Minus from './minus.png';
import VektorBack from './vektorBack.png';

const FuncContext = createContext(null);

const defA = [0, "RUB", "USD"];
const defB = [0, "RUB", "EUR"];

function App() {
  const [menuList, setMenuList] = useState([defA, defB]);
  const savedMenuList = localStorage.getItem('menuList');
  const parsedMenuList = JSON.parse(savedMenuList);
  
  useEffect(() => {
    if (parsedMenuList && parsedMenuList.length > 0) {
      setMenuList(parsedMenuList);
    } else {
      setMenuList([defA, defB]);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('menuList', JSON.stringify(menuList));
  }, [menuList]);

  function setter(e, index, position) {
    const value = e.target.textContent;
    const newList = menuList.map((list, ind) => {
      if (ind !== index) {
        return list;
      } else return list.map((l, i) => {
        if (i !== position) {
          return l;
        } else return value;
      });
    });
    setMenuList(newList);
   
  }

  function reverse(index) {
    const newList = menuList.map((menu, i) => {
      if (i !== index) {
        return menu;
      } else {
        return [menu[0], menu[2], menu[1]]; 
      }
    });
    setMenuList(newList);
  }
  
  function onInputChange(index, key, val) {
    const newList = menuList.map((list, i) => {
      if (i !== index) {
        return list;
      } else return list.map((l, i) => {
        if (i !== key) {
          return l;
        } else {
          return val;
        }
      });
    });
    setMenuList(newList);
    
  }

  function addClick() {
    const addlist = [0, "RUB", "USD"];
    setMenuList([...menuList, addlist]);
  }


  function deleteClick(index) {
    const newlist = menuList.filter((menu, i) => i !== index);
    setMenuList(newlist);
  }
  
  
  return (
    <FuncContext.Provider value={onInputChange}>
      <div className="container">
        {menuList.map((menu, index) => (
          <div  key={index}>
            
            <Menu addClick={addClick} setter={setter} deleteClick={deleteClick} 
             index={index} isLast={index === menuList.length - 1} reverse={reverse}
             amount={menu[0]} from={menu[1]} to={menu[2]} />
            
          </div>
        ))}
        {menuList.length == 0 && <Adder addclass="adderOnlyOne" func={addClick} />}
        
      </div>
    </FuncContext.Provider>
  );
}

function Adder({ func, addclass }) {
  return (
    <button onClick={func} className={`adder ${addclass}`}>
      <img src={Plus} alt="plus" />
    </button>
  );
}

function Delete({ func }) {
  return (
    <div>
      <button className="minus" onClick={func} >
        <img src={Minus} alt="minus" />
      </button>
    </div>
  );
}

function Player({ index, vektor, from, to, shower, options, choser, choose, setter }) {
  const [intervalH, setIntervalH] = useState(3);
  const onInput = useContext(FuncContext);
  const currencyValue = vektor === 1 ? from : to;
  const column = vektor === 1 ? "From" : "To";
  const finds = findMoneys(currencyValue);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 768) {
      setIntervalH(6);
      }
      else setIntervalH(3);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  

  
  return (
    <div className="block">
      <label htmlFor="text">{column}</label>
      <br />
      <div className="input-wrapper">
        <input
          onMouseEnter={() => {
            shower(true);
            choser();
          }}
          onChange={(e) => onInput(index, vektor, e.target.value)}
          value={currencyValue}
          id="text"
          type="text"
          autoComplete="off"
        />
      </div>
      {options && choose === column && finds.map((find, i) => (
        <div onClick={(e) => setter(e, index, vektor)} key={i} style={{ marginTop: `${i * intervalH}vh` }} className="money">
          {find}
        </div>
      ))}
    </div>
  );
}

function Input({index, amount, from, to, inputControl}) {
  useEffect(() => {
    if (currencies.includes(from) && currencies.includes(to)) {
    inputControl(amount, from, to);
  }}, [amount, from, to])
  const onInput = useContext(FuncContext);
  function devicedOnInput(e) {
    onInput(index, 0, e.target.value);
    

  }
  return (
    
      <input className="inputDiv" onChange={devicedOnInput} value={amount}
       id="text" type="text" autoComplete="off" />
    

  )
}

function Amount({ index, amount, from, to, inputControl }) {
  
  
  return (
    <div className="block">
      <label htmlFor="text">Amount</label>
      <div className="input-wrapper">
        <Input index={index} amount={amount} inputControl={inputControl} from={from} to={to}/>
        
      
      </div>
    </div>
  );
}

function Menu({ from, to, amount, index, reverse, setter, addClick, deleteClick, isLast }) {
  const [show, setShow] = useState(false);
  const [options, setOptions] = useState(false);
  const [choose, setChoose] = useState(null);
  const [num, setNum] = useState(0);
  
  function showOptions(toShow) {
    setOptions(toShow);
  }
  
  function letCaclculate(changeShow, amount, from, to) {
    setShow(changeShow);
    startChange(amount, from, to);
  }

  function startChange(amount, from, to) {
    const isNumber = !isNaN(parseFloat(amount)) && isFinite(amount) && amount >= 0;
    console.log(from, to);
    const isCurrency = currencies.includes(from.toUpperCase()) || currencies.includes(to.toUpperCase());
    
    if (isNumber && isCurrency) {
      exchange(from, to).then(res => {
        if (res == "unknown quantity of") {
          setNum(res)
        } else {
        res = res * amount;
        setNum(res.toFixed(2));
        }
      });
    } else {
      setNum("unknown");
    }
  }
  
  function changeDirectionCalc() {
    [from, to] = [to, from];
    reverse(index);
    startChange();
  }

  
  
  return (
    <div className="columnSideOfMenu">
      
      <div className="menu" onMouseLeave={() => showOptions(false)}>
      <Delete func={() => deleteClick(index)} />
        <Amount amount={amount} index={index} from={from} to={to} inputControl={startChange} />
        <Player setter={setter} choser={() => setChoose("From")} choose={choose} from={from} options={options} shower={showOptions} vektor={1} index={index} />
        <ExchangeVektor onVektorClick={changeDirectionCalc} />
        <Player setter={setter} choser={() => setChoose("To")} choose={choose} vektor={2} options={options} shower={showOptions} to={to} index={index} />
      </div>
      <div className="interAction">
        {show && <Result num={num} kind={to} />}
        <button onClick={() => letCaclculate(true, amount, from, to)}  className="calcButton">
          {'Calculate'}
        </button>
        {show && <button type="" onClick={() => letCaclculate(false, amount, from, to)} className="calcButton">Hide</button>}
        {isLast && <Adder addclass="adder" func={addClick} />}
      </div>
      
    </div>
  );
}

function ExchangeVektor({ onVektorClick }) {
  return (
    
      <button className="arrowWrapper" onClick={onVektorClick}>
      <img className="arrows" src={VektorBack} alt="vektor-back" />
      </button>
    
  );
}

function Result({ num, kind }) {
  return (
    <div className="result">
      <span>{num} {kind}</span>
    </div>
  );
}

function findMoneys(start) {
  start = transliterate(start);
  start = start.toUpperCase();
  const curs = currencies.filter(cur => cur.startsWith(start));
  return curs;
}

async function exchange(from = "", to = "") {
  try {
    
    const res = await fetch(`https://v6.exchangerate-api.com/v6/4f9059fdd169d7383a8a6367/latest/${from}`);
    const json = await res.json();
    const result = json.conversion_rates[to];
    if (isNaN(result)) {
      return "unknown quantity";
    }
    return result;
  } catch (error) {
    console.error('An error occurred during fetching', error);
    return "апи недоступен, исчерпал лимит"; 
  }
}

function transliterate(text) {
  const rusToLatMap = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "zh", "з": "z", "и": "i",
    "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t",
    "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "sch", "ъ": "", "ы": "y", "ь": "'",
    "э": "e", "ю": "yu", "я": "ya"
  };

  return text.split('').map(char => rusToLatMap[char.toLowerCase()] || char).join('');
}

export default App;
choose