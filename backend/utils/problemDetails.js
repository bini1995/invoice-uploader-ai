import { STATUS_CODES } from 'http';

const defaultTypeForStatus = (status) => `https://httpstatuses.com/${status}`;

const buildProblemDetails = ({
  status,
  title,
  detail,
  instance,
  type,
  errors,
  extra
} = {}) => {
  const resolvedStatus = status || 500;
  const problem = {
    type: type || defaultTypeForStatus(resolvedStatus),
    title: title || STATUS_CODES[resolvedStatus] || 'Unknown Error',
    status: resolvedStatus,
    ...(detail && { detail }),
    ...(instance && { instance })
  };

  if (errors) {
    problem.errors = errors;
  }

  if (extra && typeof extra === 'object') {
    Object.assign(problem, extra);
  }

  return problem;
};

export default buildProblemDetails;
