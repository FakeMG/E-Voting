import { Candidate } from "@/lib/package/entities/poll.entity";
import React, { useState } from "react";
import useCandidates from "./Candidates.hook";

type CandidatesProps = {
  value: number;
  index: number;
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
};

export default function Candidates(props: CandidatesProps) {
  const { value, index, candidates, setCandidates } = props;
  const { handleInputChange, addCandidate } = useCandidates({
    candidates,
    setCandidates,
  });
  const [candidateInput, setCandidateInput] = useState("");

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
                    <th className="border px-4 py-2">Candidates</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((item, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">
                        <input
                          type="text"
                          placeholder="Candidate Name"
                          value={item.name}
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
                        type="text"
                        placeholder="Candidate Name"
                        value={candidateInput}
                        onChange={(e) => setCandidateInput(e.target.value)}
                        className="w-full border p-2 rounded-md"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <button
                onClick={() => {
                  addCandidate(candidateInput);
                  setCandidateInput("");
                }}
                className="mt-4 p-2 bg-blue-500 text-white rounded-md"
              >
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
