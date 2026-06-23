// script.js — drag/drop, preview, and simple UX for upload form
(function(){
  const dropArea = document.getElementById('dropArea');
  const input = document.getElementById('image');
  const preview = document.getElementById('preview');
  const placeholder = document.getElementById('placeholder');
  const form = document.getElementById('uploadForm');

  function preventDefaults(e){ e.preventDefault(); e.stopPropagation(); }
  ['dragenter','dragover','dragleave','drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
  })

  ['dragenter','dragover'].forEach(ev => dropArea.addEventListener(ev, ()=> dropArea.classList.add('dragover')))
  ['dragleave','drop'].forEach(ev => dropArea.addEventListener(ev, ()=> dropArea.classList.remove('dragover')))

  dropArea.addEventListener('drop', handleDrop, false)
  function handleDrop(e){
    const dt = e.dataTransfer
    const files = dt.files
    if(files && files.length) setFile(files[0])
  }

  // when user clicks "browse" label, forward to input
  input.addEventListener('change', ()=> {
    if(input.files && input.files[0]) setFile(input.files[0])
  })

  function setFile(file){
    if(!file.type.startsWith('image/')){
      alert('Please upload an image file')
      return
    }
    placeholder.style.display = 'none'
    preview.innerHTML = ''
    const img = document.createElement('img')
    img.src = URL.createObjectURL(file)
    img.onload = ()=> URL.revokeObjectURL(img.src)
    img.className = 'img-fluid'
    preview.appendChild(img)

    // attach file to the hidden input if not already
    // (input already has it via browsing; for drop we need to set)
    try{
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
    }catch(err){
      // older browsers may not support DataTransfer; in that case rely on input
    }
  }

  // optional: show a waiting state on submit
  form.addEventListener('submit', ()=>{
    const btn = document.getElementById('submitBtn')
    btn.disabled = true
    const old = btn.innerHTML
    btn.innerHTML = 'Analyzing...'
  })
})();
