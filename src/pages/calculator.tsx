import { promises } from 'fs';
import { GetStaticProps, NextPage } from 'next';
import { join } from 'path';
import React, { ReactElement, useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { CatImage } from '../components/CatImage';
import { Country, RandomCat } from '../lib/Types.js';

type Props = Readonly<{
  countries: Array<Country>;
}>;


const IndexPage: NextPage<Props> = ({ countries }: Props): ReactElement => {
  const [display, setDisplay] = useState<string>('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [preValue, setPreValue] = useState<number>(0);
  const [justCalculated, setJustCalculated] = useState<boolean>(false);
  const [labourHours, setLabourHours] = useState<string>('0');
  const [catImage, setCatImage] = useState<null | RandomCat>(null);


  const calculate = (a: number, operator: string, b: number ): number | null => {
    switch(operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? null : a / b;
      default: return null;
    }
  };
  const handleNumberInput = (label: string) : void => {
    if(justCalculated) {
      // 直前に計算した場合は新しい数字を入力したときに表示をリセットする
      setDisplay(label === '.' ? '0.' : label);
      setJustCalculated(false);
      return;
    }
    // 小数点の重複防止 1.2.3 のようにならないようにする
    if(label === '.' && display.includes('.')) {
      return;
    }
    // 先頭が0のときは0を消す、ただし小数点の場合は0を残す
    if(display === '0' && label !== '.') {
      setDisplay(label);
    } else { 
      setDisplay(display + label);  
    }
  };
  const handleOperator = (label: string): void => {
    if(isNaN(Number(display))) {
      setDisplay('0');
      setOperator(label);
      return;
    }
    // 演算子を押したとき、既に演算子があれば途中計算してから保存する
    if(operator) {
      const intermediate = calculate(preValue, operator, Number(display));
      if(intermediate === null) {
        setDisplay('Error: Division by zero');
        setJustCalculated(true);
        return;
      }
      setPreValue(intermediate);
    } else {
      setPreValue(Number(display));
    }
    setDisplay('0');
    // 演算子が連続している場合は最後の演算子を置き換える
    setOperator(label);
  };

  useEffect(() => {
    fetch('https://api.thecatapi.com/v1/images/search').then(async (res: Response) => {
      const json: Array<RandomCat> = await res.json() as Array<RandomCat>;

      setCatImage(json[0]!);
    });
  }, []);

  return (
    <>
      <div className="m-10 p-4 w-2/3 mx-auto shadow-lg border-2 rounded-2xl">
        <div className="mx-auto">
          <div className="p-3 mb-3 border-2 rounded h-full w-full flex justify-between">
            {/* 自動更新されて表示される */}
            <span className="text-gray-400 select-none">
              {operator ? `前の値: ${preValue}  ${operator}` : ''}

            </span>
            <span className="text-gray-700 select-none">{display}</span>
          </div>
          
            {[['7','8','9','/'],
              ['4','5','6','*'],
              ['1','2','3','-'],
              ['.','0','','+'],
              ['AC', 'C', '=']
            ].map((row: Array<string>) => {
              return (
                <div key={row[0]} className="grid grid-cols-4 gap-2">
                  {row.map((calcButtonLabel: string) => {
                    // 空白の部分は何も表示しない
                    // key="empty" は人間が読んだときに「ここは空欄だな」とわかりやすくするための名前にすぎません。
                    if(calcButtonLabel === '') {
                      return <div key={"empty"} />;
                    }

                    return (
                      <Button
                        key={calcButtonLabel}
                        className={
                          calcButtonLabel === operator
                          ? "py-2 bg-cyan-700 text-white rounded border border-gray-200 cursor-pointer shadow-inner"
                          : "py-2 bg-cyan-600 text-white rounded border border-gray-200 cursor-pointer"
                        }
                        onClick={() => {
                          if('1234567890.'.includes(calcButtonLabel)) {
                            handleNumberInput(calcButtonLabel);
                          } else if ('+-*/'.includes(calcButtonLabel)) {
                            handleOperator(calcButtonLabel);
                          } else {
                            switch(calcButtonLabel) {
                              case 'C':
                                setDisplay('0');
                                break;
                              case 'AC':
                                setDisplay('0');
                                setPreValue(0);
                                setOperator(null);
                                break;
                              case '=':{
                                if ( operator === null) {return;}
                                const result = calculate(preValue, operator, Number(display));
                                if(result === null) {
                                  setDisplay('Error: Division by zero');
                                  setJustCalculated(true);
                                  return;
                                }
                                setDisplay(String(result));
                                setOperator(null);
                                setPreValue(0);
                                break;
                              }
                            }
                          }
                        }}
                      >
                        <span className="select-none text-xl">{calcButtonLabel}</span>
                      </Button>
                    );
                  })}
                </div>
              );
            })}
        </div>
      </div>
      <div className="m-10 p-4 w-2/3 mx-auto shadow-lg border-2 rounded-2xl">
        <div className="mx-auto">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-800 text-lg">勤務開始時間</span>
            <span className="text-gray-800 text-lg">勤務終了時間</span>
            <span className="text-gray-800 text-lg">労働時間</span>
            <input
              className="py-2 px-3 border-2 rounded border-gray-200 cursor-text"
              type="text"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                console.log(e.target.value);

                setLabourHours(e.target.value);
              }}
            />
            <input
              className="py-2 px-3 border-2 rounded border-gray-200 cursor-text"
              type="text"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                console.log(e.target.value);

                setLabourHours(e.target.value);
              }}
            />
            <span className="select-none text-xl font-mono text-gray-700 text-right">{labourHours}</span>
          </div>
        </div>
      </div>
      <div className="m-10 p-4 w-2/3 mx-auto shadow-lg border-2 rounded-2xl">
        <ul className="list-none">
          {countries.map((country: Country) => {
            return (
              <li key={country.alpha2} className="text-gray-800 even:bg-teal-100 text-lg">
                <div className="my-1">{country.jpnName}</div>
                <div className="my-1">{country.engName}</div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="m-10 p-4 w-2/3 mx-auto shadow-lg border-2 rounded-2xl">
        フォームで使いそうなもの
        <ul className="list-none">
          <li className="text-gray-800 even:bg-teal-100 text-lg">
            <input
              className="py-2 px-3 border-2 rounded border-gray-200 cursor-text"
              type="text"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                console.log(e.target.value);

                setLabourHours(e.target.value);
              }}
              placeholder="テキストボックスです"
            />
          </li>
          <li>
            <select
              className="cursor-pointer border rounded py-3 px-4"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                console.log(e.target.value);
              }}
              value={0}
            >
              <option value={0}>選択してください</option>
              <option value={1}>選択肢1</option>
              <option value={2}>選択肢2</option>
              <option value={3}>選択肢3</option>
            </select>
          </li>
        </ul>
      </div>
      <div className="m-10 p-4 w-2/3 mx-auto shadow-lg border-2 rounded-2xl">
        <CatImage cat={catImage} />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const buffer = await promises.readFile(join(process.cwd(), 'json', 'countries.json'));
  const str = buffer.toString();

  return {
    props: {
      countries: JSON.parse(str) as Array<Country>
    }
  };
};

// eslint-disable-next-line import/no-default-export
export default IndexPage;
