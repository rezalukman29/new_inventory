import React from "react";

type Props = {
  title: string;
  isRequired?: boolean;
};

const Label = ({ title, isRequired }: Props) => {
  return (
    <div className="mb-2">
      <label htmlFor={title} className="font-semibold" style={{ fontSize: 12 }}>
        {title}
      </label>
      {isRequired && (
        <label
          htmlFor={title?.replaceAll(" ", "")?.toLowerCase()}
          className="font-semibold"
          style={{ color: "#a6192e", fontSize: 14 }}
        >
          {" "}
          *
        </label>
      )}
    </div>
  );
};

export default Label;
