import axios from "axios";
import { useState, useEffect } from "react";
import { iMeds, iStock } from "./interfaces";

function App() {
  const [dataa, setdataa] = useState<iMeds[] | any>();
  const [formulary, setformulary] = useState<iMeds[] | any>([]);
  const [load, setload] = useState(true);
  const [load2, setload2] = useState(true);
  const [spinner, setspinner] = useState(true);
  const [fetched, setfetched] = useState<iStock[] | any>();

  var data: iMeds[] = [];
  var tw = { width: "200px" };
  useEffect(() => {
    axios
      .get(
        "https://notion-api-teal.vercel.app/getblock/0a9e4543b5754f7e9e2919b7635f668d"
      )
      .then(function (response) {
        // handle success
        setdataa({
          Medications: JSON.parse(
            response.data.results[0].paragraph.text[0].plain_text
          ),
        });
        setload2(false);
      })
      .catch(function (error) {
        // handle error
        console.error(error);
      });

    if (
      localStorage.getItem("stock") === undefined ||
      localStorage.getItem("stock") === null
    ) {
      axios
        .get(
          "https://notion-api-teal.vercel.app/getblock/3cd93915b51b466a8012b49020a6e921"
        )
        .then(function (response) {
          // handle success

          setfetched(
            JSON.parse(response.data.results[0].paragraph.text[0].plain_text)
          );

          localStorage.setItem(
            "stock",
            response.data.results[0].paragraph.text[0].plain_text
          );
          setload(false);
          setspinner(false);
        })
        .catch(function (error) {
          // handle error
          console.error(error);
        });
    } else {
      setload(false);

      let parseable = JSON.parse(localStorage.getItem("stock") || "{}");
      setfetched(parseable);
      setspinner(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("stock", JSON.stringify(fetched));
  }, [fetched]);

  // SET LOCALSRAGE FOR REFRESH
  useEffect(() => {
    let ls = localStorage.getItem("formulary");
    if (ls !== null && ls !== undefined) {
      if (JSON.parse(ls).length > 0) {
        setformulary(JSON.parse(ls));
      }
    }
  }, []);

  const addToFormulary = (item: iMeds, st: iMeds) => {
    let match = formulary.filter((f: iMeds) => {
      return f === item;
    });

    if (!match.length) {
      setformulary([...formulary, item]);
      localStorage.setItem("formulary", JSON.stringify([...formulary, item]));
      let filt = fetched.filter((stock: iStock) => {
        return stock.medicationName === st.medicationName;
      });
      let removeOne = fetched.filter((stock: iStock) => {
        return stock.medicationName !== st.medicationName;
      });

      setfetched([
        ...removeOne,
        { medicationName: filt[0].medicationName, stock: filt[0].stock - 1 },
      ]);

      console.log(`${item.medicationName} added to prescription.`);
    } else {
      alert(
        "You have reached the limit of the item prescribed. Contact you doctor for emergencies"
      );
      console.log(
        "You have reached the limit of the item prescribed. Contact you doctor for emergencies"
      );
    }
  };

  function MedTable() {
    if (dataa !== undefined && load === false) {
      data = dataa.Medications.map((item: iMeds, index: Number) => {
        var st = fetched.filter((x: iStock) => {
          if (x.medicationName === item.medicationName) {
            return x;
          }
        });

        return (
          <tr key={index.toString()}>
            <td style={tw}>{item.medicationName}</td>
            <td style={tw}>{item.Strength}</td>
            <td style={tw}>{item.Pack_Size}</td>
            <td style={{ width: "100px", textAlign: "center" }}>
              <button
                onClick={() => {
                  addToFormulary(item, st[0]);
                }}
              >
                add
              </button>
            </td>
            <td>
              {spinner === true ? (
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                st[0].stock
              )}
            </td>
          </tr>
        );
      });
      return (
        // the design is mobile friendly!
        <div className="scrollable">
          <table>
            <thead>
              <tr>
                <th style={tw}>Medication</th>
                <th style={tw}>Strength</th>
                <th style={tw}>Pack Size</th>
                <th style={{ width: "100px" }}>add</th>
                <th style={tw}>Stock</th>
              </tr>
            </thead>
            <tbody>{data}</tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div>
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }
  }

  function DropFormulary() {
    if (!formulary.length && load2 === false) {
      return <p className="m-2">add some medication to formulary</p>;
    } else if (load2 === false) {
      var fmapped = formulary.map((x: iMeds, index: Number) => {
        return (
          <div key={index.toString()} className="d-flex flex-row">
            <p className="me-3">{x.medicationName}</p>
            <p className="me-3">{x.Strength}</p>
            <p className="me-3">{x.Pack_Size}</p>
          </div>
        );
      });
      return (
        <div className="m-2">
          <h4>formulary</h4>
          {fmapped}
          <button
            onClick={() => {
              let items = formulary
                .map((element: iMeds) => {
                  return element.medicationName;
                })
                .join(", ");

              console.log(
                `Medication with items ${items} is being fulfilled. Thank you for choosing Truepill`
              );
              localStorage.removeItem("formulary");
              setformulary([]);
            }}
          >
            complete
          </button>
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <div className="App">
      <MedTable />
      <DropFormulary />
    </div>
  );
}

export default App;
