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
        {menuList.map((menu, index) => (
          <div className="lineBlock" key={index}>
            <Delete func={() => deleteClick(index)} />
            <Menu setter={setter} index={index} reverse={reverse} amount={menu[0]} from={menu[1]} to={menu[2]} />
            {index === menuList.length - 1 && <Adder func={addClick} />}
          </div>
        ))}
        {menuList.length === 0 && <Adder addclass="center" func={addClick} />}
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
    <button onClick={func} className="minus">
      <img src={Minus} alt="minus" />
    </button>
  );
}

function Player({ index, vektor, from, to, shower, options, choser, choose, setter }) {
  const onInput = useContext(FuncContext);
  const currencyValue = vektor === 1 ? from : to;
  const column = vektor === 1 ? "From" : "To";
  const finds = findMoneys(currencyValue);
  
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
        <div onClick={(e) => setter(e, index, vektor)} key={i} style={{ marginTop: `${i * 3}vh` }} className="money">
          {find}
        </div>
      ))}
    </div>
  );
}

function Amount({ index, amount }) {
  const onInput = useContext(FuncContext);
  
  return (
    <div className="block">
      <label htmlFor="text">Amount</label>
      <div className="input-wrapper">
        <input onChange={(e) => onInput(index, 0, e.target.value)} value={amount} id="text" type="text" autoComplete="off" />
      </div>
    </div>
  );
}

function Menu({ from, to, amount, index, reverse, setter }) {
  const [show, setShow] = useState(false);
  const [options, setOptions] = useState(false);
  const [choose, setChoose] = useState(null);
  const [num, setNum] = useState(0);
  
  function showOptions(toShow) {
    setOptions(toShow);
  }
  
  function letCaclculate(changeShow) {
    setShow(changeShow);
    startChange();
  }

  function startChange() {
    const isNumber = !isNaN(parseFloat(amount)) && isFinite(amount) && amount >= 0;
    const isCurrency = currencies.includes(from.toUpperCase()) || currencies.includes(to.toUpperCase());
    
    if (isNumber && isCurrency) {
      exchange(from, to).then(res => {
        res = res * amount;
        setNum(res.toFixed(2));
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
    <div className="calculate">
      <div className="menu" onMouseLeave={() => showOptions(false)}>
        <Amount amount={amount} index={index} />
        <Player setter={setter} choser={() => setChoose("From")} choose={choose} from={from} options={options} shower={showOptions} vektor={1} index={index} />
        <ExchangeVektor onVektorClick={changeDirectionCalc} />
        <Player setter={setter} choser={() => setChoose("To")} choose={choose} vektor={2} options={options} shower={showOptions} to={to} index={index} />
      </div>
      <div className="interAction">
        {show && <Result num={num} kind={to} />}
        <button onClick={() => letCaclculate(true)} className="calcButton">
          {!show ? 'Calculate' : 'Hide'}
        </button>
        {show && <button type="" onClick={() => letCaclculate(false)} className="calcButton">Calculate</button>}
      </div>
    </div>
  );
}

function ExchangeVektor({ onVektorClick }) {
  return (
    <div onClick={onVektorClick} className="vektor">
      <img src={VektorBack} alt="vektor-back" />
    </div>
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

async function exchange(from, to) {
  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/4f9059fdd169d7383a8a6367/latest/${from}`);
    const json = await res.json();
    const result = json.conversion_rates[to];
    return result;
  } catch (error) {
    console.error('An error occurred during fetching', error);
    return "unknown quantity of"; 
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