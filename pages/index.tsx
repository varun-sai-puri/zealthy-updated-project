// pages/index.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

// Form fields
type FormValues = {
  email: string;
  password: string;
  about?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  birthDate?: string;
};

type ConfigItem = { pageNumber: number; component: string };

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<Record<number, string[]>>({ 2: ["about", "birthdate"], 3: ["address"] });
  const { register, handleSubmit, formState } = useForm<FormValues>({ mode: 'onChange' });

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then((items: ConfigItem[]) => {
        const map: Record<number, string[]> = { 2: [], 3: [] };
        items.forEach(({ pageNumber, component }) => {
          const key = component.toLowerCase();
          if (["about", "address", "birthdate"].includes(key)) {
            map[pageNumber] ||= [];
            map[pageNumber].push(key);
          }
        });
        setConfig(map);
      });
  }, []);

  const onSubmit = handleSubmit(data => {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      setStep(prev => (prev < 3 ? prev + 1 : 1));
    });
  });

  const progress = [1, 2, 3];

  return (
    <div className="wrapper">
      <div className="card">
        <div className="progress-bar">
          {progress.map(num => (
            <div key={num} className={`step-circle ${step >= num ? 'active' : ''}`}>
              {num}
            </div>
          ))}
        </div>
        <h2>Step {step} of 3</h2>
        <form onSubmit={onSubmit}>
          {step === 1 && (
            <div className="fields">
              <label>
                Email
                <input {...register("email", { required: true })} />
              </label>
              <label>
                Password
                <input type="password" {...register("password", { required: true })} />
              </label>
            </div>
          )}

          {step > 1 && (
            <div className="fields">
              {(config[step] || []).map(comp => {
                switch (comp) {
                  case "about":
                    return (
                      <label key={comp}>
                        About Me
                        <textarea {...register("about", { required: true })} />
                      </label>
                    );
                  case "address":
                    return (
                      <div key={comp} className="address-group">
                        {['street', 'city', 'state', 'zip'].map(field => (
                          <label key={field}>
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                            <input {...register(field as any, { required: true })} />
                          </label>
                        ))}
                      </div>
                    );
                  case "birthdate":
                    return (
                      <label key={comp}>
                        Birth Date
                        <input type="date" {...register("birthDate", { required: true })} />
                      </label>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          )}

          <button
            type="submit"
            disabled={!formState.isValid}
            className="btn"
          >
            {step < 3 ? "Next" : "Finish"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .wrapper {
          display: flex;
          justify-content: center;
          padding: 40px 20px;
          background: #f5f7fa;
          min-height: 100vh;
        }
        .card {
          background: #fff;
          padding: 32px;
          border-radius: 10px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 500px;
        }
        .progress-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
          position: relative;
        }
        .progress-bar::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 15px;
          right: 15px;
          height: 4px;
          background: #e0e0e0;
          transform: translateY(-50%);
          z-index: 1;
        }
        .step-circle {
          position: relative;
          z-index: 2;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e0e0e0;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .step-circle.active {
          background: #0070f3;
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }
        .fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        label {
          display: flex;
          flex-direction: column;
          font-size: 14px;
          color: #444;
        }
        input,
        textarea {
          margin-top: 8px;
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        .address-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .btn {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          color: #fff;
          background-color: #0070f3;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .btn:disabled {
          background-color: #a0cdfc;
          cursor: not-allowed;
        }
        .btn:hover:enabled {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  );
}