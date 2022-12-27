export async function getFormData(request: Request) {
  return request.clone().formData()
}
