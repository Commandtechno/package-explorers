module.exports = function (package, result) {
  const profile = package.Profile["Profile Information"].ProfileMap;
  result.profile.username = profile.userName;
  result.profile.born = new Date(profile.birthDate).toLocaleString();
  result.profile.bio = profile.bioDescription;
  result.profile.email = profile.emailAddress;
  result.profile.phone_number = profile.telephoneNumber;
};