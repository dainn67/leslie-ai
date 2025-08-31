export const parseLevelActionId = (actionId: string) => {
  const code = actionId[1];
  if (code === "0") {
    return "Beginning to learn";
  } else if (code === "5") {
    return "N5 to N4";
  } else if (code === "4") {
    return "N4 to N3";
  } else if (code === "3") {
    return "N3 to N2";
  }

  return "Beginning to learn";
};

export const parseTargetActionId = (actionId: string) => {
  const code = actionId[1];
  return `N${code}`;
};
