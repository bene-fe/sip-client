const PauseIcon = (props: { className?: string }) => {
  return (
    <div className={`${props.className}`}>
      <svg
        className="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="4168"
        width="100%"
        height="100%"
      >
        <path
          d="M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024zM320 320v384h128V320H320z m256 0v384h128V320H576z"
          fill="currentColor"
          p-id="4169"
        ></path>
      </svg>
    </div>
  )
}

export default PauseIcon
