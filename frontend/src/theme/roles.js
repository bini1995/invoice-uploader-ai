import i18n from '../i18n';

export const ROLE_EMOJI = {
  adjuster: '👨\u200d⚖️',
  medical_reviewer: '🩺',
  auditor: '👀',
};

export const getRoleDisplay = (role, showEmoji = true) => {
  const label = i18n.t(`roles.${role}`, role);
  const emoji = ROLE_EMOJI[role];
  return showEmoji && emoji ? `${emoji} ${label}` : label;
};
