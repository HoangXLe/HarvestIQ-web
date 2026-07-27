export type FieldErrors = Record<string, string>;

export function required(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required`;
  return null;
}

export function minLength(
  value: string,
  min: number,
  label: string,
): string | null {
  if (value.trim().length > 0 && value.trim().length < min) {
    return `${label} must be at least ${min} characters`;
  }
  return null;
}

export function maxLength(
  value: string,
  max: number,
  label: string,
): string | null {
  if (value.trim().length > max) {
    return `${label} must be ${max} characters or fewer`;
  }
  return null;
}

export function optionalNumber(
  value: string,
  label: string,
  opts?: { min?: number; max?: number; allowEmpty?: boolean },
): string | null {
  const allowEmpty = opts?.allowEmpty !== false;
  if (!value.trim()) return allowEmpty ? null : `${label} is required`;
  const n = Number(value);
  if (Number.isNaN(n)) return `${label} must be a number`;
  if (opts?.min !== undefined && n < opts.min) {
    return `${label} must be at least ${opts.min}`;
  }
  if (opts?.max !== undefined && n > opts.max) {
    return `${label} must be at most ${opts.max}`;
  }
  return null;
}

export function requiredNumber(
  value: number | string,
  label: string,
  opts?: { min?: number; max?: number },
): string | null {
  if (value === "" || value === null || value === undefined) {
    return `${label} is required`;
  }
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return `${label} must be a number`;
  if (opts?.min !== undefined && n < opts.min) {
    return `${label} must be at least ${opts.min}`;
  }
  if (opts?.max !== undefined && n > opts.max) {
    return `${label} must be at most ${opts.max}`;
  }
  return null;
}

export function validateFarmForm(form: {
  name: string;
  crop: string;
  acres: string;
  location: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const nameErr =
    required(form.name, "Farm name") ||
    minLength(form.name, 2, "Farm name") ||
    maxLength(form.name, 80, "Farm name");
  if (nameErr) errors.name = nameErr;

  if (!form.crop.trim()) errors.crop = "Primary crop is required";

  const acresErr = optionalNumber(form.acres, "Acreage", {
    min: 0,
    max: 1_000_000,
    allowEmpty: true,
  });
  if (acresErr) errors.acres = acresErr;

  const locErr = maxLength(form.location, 120, "Location");
  if (locErr) errors.location = locErr;

  return errors;
}

export function validateProfileForm(form: {
  name: string;
  farmname: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const nameErr =
    required(form.name, "Name") ||
    minLength(form.name, 2, "Name") ||
    maxLength(form.name, 60, "Name");
  if (nameErr) errors.name = nameErr;

  const farmErr =
    required(form.farmname, "Farm / cooperative") ||
    maxLength(form.farmname, 80, "Farm / cooperative");
  if (farmErr) errors.farmname = farmErr;

  return errors;
}

export function validateEnvForm(
  env: {
    temp: number | string;
    humidity: number | string;
    rainfall: number | string;
    leafWetness: number | string;
    trend: string;
  },
  unitsMetric: boolean,
): FieldErrors {
  const errors: FieldErrors = {};
  const tempMin = unitsMetric ? -20 : -4;
  const tempMax = unitsMetric ? 50 : 122;
  const tempErr = requiredNumber(env.temp, "Temperature", {
    min: tempMin,
    max: tempMax,
  });
  if (tempErr) errors.temp = tempErr;

  const humErr = requiredNumber(env.humidity, "Humidity", {
    min: 0,
    max: 100,
  });
  if (humErr) errors.humidity = humErr;

  const rainMax = unitsMetric ? 500 : 20;
  const rainErr = requiredNumber(env.rainfall, "Rainfall", {
    min: 0,
    max: rainMax,
  });
  if (rainErr) errors.rainfall = rainErr;

  const wetErr = requiredNumber(env.leafWetness, "Leaf wetness", {
    min: 0,
    max: 24,
  });
  if (wetErr) errors.leafWetness = wetErr;

  if (!String(env.trend || "").trim()) {
    errors.trend = "Forecast trend is required";
  }

  return errors;
}

export function validateResourcesForm(form: {
  location: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const locErr =
    required(form.location, "Location") ||
    minLength(form.location, 2, "Location") ||
    maxLength(form.location, 120, "Location");
  if (locErr) errors.location = locErr;
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
