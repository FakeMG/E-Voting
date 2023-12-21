import React, { useRef, useState } from "react";
import useEligibleVoter from "./EligibleVoter.hook";

type EligibleVotersProps = {
  value: number;
  index: number;
  voters: string[];
  setVoters: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function EligibleVoters(props: EligibleVotersProps) {
  const { value, index, voters, setVoters } = props;
  const { handleInputChange, addEligibleVoter } = useEligibleVoter({
    voters,
    setVoters,
  });
  const [voterInput, setVoterInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && (
        <div className="w-full h-full">
          <div className="w-full h-full">
            <div className="container mx-auto mt-8">
              <table className="table-auto">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Eligible Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {voters.map((item, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">
                        <input
                          type="email"
                          placeholder="Voter's Email"
                          value={item}
                          onChange={(e) =>
                            handleInputChange(index, e.target.value)
                          }
                          className="w-full border p-2 rounded-md"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border px-4 py-2">
                      <input
                        ref={inputRef}
                        type="email"
                        placeholder="Voter's Email"
                        value={voterInput}
                        onChange={(e) => setVoterInput(e.target.value)}
                        className="w-full border p-2 rounded-md"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <button
                onClick={() => {
                  if (inputRef.current?.checkValidity()) {
                    addEligibleVoter(voterInput);
                    setVoterInput("");
                  }
                }}
                className="mt-4 p-2 bg-blue-500 text-white rounded-md"
              >
                Add Voter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
