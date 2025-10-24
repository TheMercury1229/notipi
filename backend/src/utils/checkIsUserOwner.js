export const isUserOwnerOfKey = (authId, apiKey) => {
  if (authId !== apiKey.user.toString()) {
    return false;
  }
  return true;
};

export const isUserOwnerOfTemplateOrTemplateIsPublic = (authId, template) => {
  if (template.isPublic) {
    return true;
  }
  if (authId !== template.owner.toString()) {
    return false;
  }
  return true;
};

export const isUserOwnerOfTemplate = (authId, template) => {
  if (authId !== template.owner.toString()) {
    return false;
  }
  return true;
};
