import { useEffect } from "react";
import { useCalculatorStore, TYPE_INPUT } from "../../store/calculator";
import { CalculatorButton } from "./CalculatorButton";
import { calculatorInputLogic } from "./calculatorLogic";
import SimpleNavMenu from "../Menu/SimpleNavMenu";
import OpenInfo from "../SystemDesign/OpenInfo";

export default function Calculator() {
  const { display, log, power } = useCalculatorStore();
  const { handleOperationInput, disableBackButton } = calculatorInputLogic();
  const styleDisplay = power
    ? "col-span-4 overflow-hidden rounded-md bg-lime-400 px-2 py-1 text-end font-digitalDisplay text-3xl"
    : "col-span-4 overflow-hidden rounded-md bg-lime-800 px-2 py-1 text-start text-white px-4 text-sm py-3 font-digitalDisplay";

  const handleKeydownEvent = (e: KeyboardEvent) => {
    // console.log(e.key, power);
    switch (e.key) {
      case "0": {
        if (power) handleOperationInput("0", TYPE_INPUT.NUMBER);
        break;
      }
      case "1": {
        if (power) handleOperationInput("1", TYPE_INPUT.NUMBER);
        break;
      }
      case "2": {
        if (power) handleOperationInput("2", TYPE_INPUT.NUMBER);
        break;
      }
      case "3": {
        if (power) handleOperationInput("3", TYPE_INPUT.NUMBER);
        break;
      }
      case "4": {
        if (power) handleOperationInput("4", TYPE_INPUT.NUMBER);
        break;
      }
      case "5": {
        if (power) handleOperationInput("5", TYPE_INPUT.NUMBER);
        break;
      }
      case "6": {
        if (power) handleOperationInput("6", TYPE_INPUT.NUMBER);
        break;
      }
      case "7": {
        if (power) handleOperationInput("7", TYPE_INPUT.NUMBER);
        break;
      }
      case "8": {
        if (power) handleOperationInput("8", TYPE_INPUT.NUMBER);
        break;
      }
      case "9": {
        if (power) handleOperationInput("9", TYPE_INPUT.NUMBER);
        break;
      }
      case "+": {
        if (power) handleOperationInput("+", TYPE_INPUT.OPERATOR);
        break;
      }
      case "-": {
        if (power) handleOperationInput("-", TYPE_INPUT.OPERATOR);
        break;
      }
      case "/": {
        if (power) handleOperationInput("/", TYPE_INPUT.OPERATOR);
        break;
      }
      case "*": {
        if (power) handleOperationInput("*", TYPE_INPUT.OPERATOR);
        break;
      }
      case "Backspace": {
        if (disableBackButton(TYPE_INPUT.BACK)) return;
        if (power) handleOperationInput("Back", TYPE_INPUT.BACK);
        break;
      }
      case ".": {
        if (power) handleOperationInput(".", TYPE_INPUT.DOT);
        break;
      }
      case "Enter": {
        if (power) handleOperationInput("=", TYPE_INPUT.EQUAL);
        break;
      }
      case "Escape": {
        if (power) handleOperationInput("AC", TYPE_INPUT.CLEAR);
        break;
      }
      case " ": {
        handleOperationInput("ON", TYPE_INPUT.POWER);
        break;
      }
      default: {
        break;
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeydownEvent);
    return () => {
      document.removeEventListener("keydown", handleKeydownEvent);
    };
  }, [display, log, power]);

  return (
    <div className="h-full w-full bg-gradient-to-b from-slate-900">
      <SimpleNavMenu />
      <main className="mx-auto flex max-w-screen-lg flex-col items-center">
        <section className="relative flex w-fit justify-center gap-2">
          <h2 className="pb-3 pt-6 font-logCalculator text-3xl text-slate-100">
            Calculator
          </h2>
          <OpenInfo
            idClose="CloseDialogInfoCalc"
            idDialog="DialogForInfoCalc"
            idOpen="OpenDialogInfoCalc"
          >
            <h3 className="text-lg text-blue-600">
              This calculator is a simple one, but you can control it with the
              keyboard!
            </h3>
            <p className="self-start text-red-700">Controls:</p>
            <ul className="h-40 w-full *:pl-2 *:text-sm">
              <li>
                - Use <em className="text-red-600">Space</em> key to turn ON the
                calculator.
              </li>
              <li>
                - Use any <em className="text-red-600">Numerical Key</em> for
                digits from 0 to 9 .
              </li>
              <li>
                - Use <em className="text-red-600">Backspace</em> key to delete
                your last input.
              </li>
              <li>
                - Use <em className="text-red-600">Esc</em> key to reset the
                display.
              </li>
              <li>
                - Use <em className="text-red-600">Symbol Keys</em> for
                operations (., +, -, *, /).
              </li>
              <li>
                - Use <em className="text-red-600">Enter</em> key to get the
                result of your operation.
              </li>
            </ul>
          </OpenInfo>
        </section>
        <div className="mt-6 flex min-w-full flex-col items-center justify-between gap-12 md:flex-row md:px-7">
          <div className="grid w-[400px] grid-cols-4 gap-3 rounded-xl border-4 border-slate-800 bg-slate-700 px-5 pb-8 pt-6 shadow-2xl md:max-w-md">
            <div className={`${styleDisplay} transition-colors`}>
              <p className="">
                {power ? display : "Turn ON the calculator to use"}
              </p>
            </div>
            <div className="col-span-4 mx-1 grid w-full grid-cols-4 gap-1">
              <section className="col-span-4 flex items-center justify-between gap-1 ">
                <section className="flex w-[74.6%] items-center justify-between gap-1">
                  <CalculatorButton
                    id={"AC"}
                    type={TYPE_INPUT.CLEAR}
                    disableOutside={!power}
                  />
                  <CalculatorButton
                    id={"Back"}
                    type={TYPE_INPUT.BACK}
                    disableOutside={
                      !power || disableBackButton(TYPE_INPUT.BACK)
                    }
                  />
                </section>
                {/* <CalculatorButton
                id={"Ans"}
                type={TYPE_INPUT.ANS}
                disableOutside={!power}
              /> */}
                <section>
                  <CalculatorButton id={"ON"} type={TYPE_INPUT.POWER} />
                </section>
              </section>
              <section className="col-span-3 grid grid-cols-3 gap-1 ">
                <CalculatorButton
                  id={"8"}
                  type={TYPE_INPUT.NUMBER}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"9"}
                  type={TYPE_INPUT.NUMBER}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"7"}
                  type={TYPE_INPUT.NUMBER}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"4"}
                  type={TYPE_INPUT.NUMBER}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"5"}
                  type={TYPE_INPUT.NUMBER}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"6"}
                  type={TYPE_INPUT.NUMBER}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"1"}
                  type={TYPE_INPUT.NUMBER}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"2"}
                  type={TYPE_INPUT.NUMBER}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"3"}
                  type={TYPE_INPUT.NUMBER}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"."}
                  type={TYPE_INPUT.DOT}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"0"}
                  type={TYPE_INPUT.NUMBER}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"="}
                  type={TYPE_INPUT.EQUAL}
                  disableOutside={!power}
                />
              </section>
              <section className="col-start-4 flex flex-col items-center gap-1">
                <CalculatorButton
                  id={"+"}
                  type={TYPE_INPUT.OPERATOR}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"-"}
                  type={TYPE_INPUT.OPERATOR}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"*"}
                  type={TYPE_INPUT.OPERATOR}
                  disableOutside={!power}
                />
                <CalculatorButton
                  id={"/"}
                  type={TYPE_INPUT.OPERATOR}
                  disableOutside={!power}
                />
              </section>
            </div>
          </div>
          <section className="w-full max-w-md rounded-sm border border-slate-300 bg-slate-100 p-6 text-end transition-all md:basis-2/4 lg:basis-3/5">
            <h3 className="text-left">Log:</h3>
            <ul>
              {log.map((operation, i) => (
                <li key={i}>{operation}</li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
