import { Candidate } from "@/lib/package/entities/poll.entity";
import useGeneralSetting from "./GeneralSetting.hook";
import "./style.css";

type GeneralSettingProps = {
  pollName: string;
  candidates: Candidate[];
  voters: string[];
  votingTime: number;
  value: number;
  index: number;
};

export default function GeneralSetting(props: GeneralSettingProps) {
  const { value, index, pollName } = props;
  const { tableContentParams } = useGeneralSetting({ ...props });

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && (
        <div>
          <div className="font-semibold text-primary-700">
            Your project configuration
          </div>

          <div className="pt-4">
            <table>
              <tbody>
                <tr className="hidden">
                  <th style={{ width: "20%", background: "#edf3f5" }}>Title</th>
                  <th style={{ width: "80%" }}>Contact</th>
                </tr>
                {tableContentParams.map((item) => {
                  return (
                    <tr key={item.id}>
                      <td style={{ width: "20%", background: "#edf3f5" }}>
                        {item.title}
                      </td>
                      <td style={{ width: "80%" }}>
                        {item.id === "candidates"
                          ? (item.value as Candidate[]).length
                          : item.id === "voters"
                          ? (item.value as string[]).length
                          : String(item.value)}
                        &nbsp; {item.afterFix}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
