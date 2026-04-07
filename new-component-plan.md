# New Component Research and Planning

For this project I will implement Multer for .txt file uploads

## Implementation

In my project Multer will acts as a middleware that will handle file uploads. I will implement Multer to allow users to upload .txt files.
These .txt files will be processed and formatted into JSON objects. Afterwards,
these JSON objects will be sent through API's and passed along to services depending
on the request type.

## Integration 

Based on my research I will need to integrate Multer in both the front end
as well as the backend. Starting with the front-end I would have to create
a form with the enctype of multipart/form-data and a method of post. In the form I would
create an input type for a file with the class of form-control-file with its designated name
(e.g. "uploaded_file"). As for the backend I will have to create middleware functions that handle storage(memory or disk storage), limiting,
file filtering. After this process the information will be passed onto specified services based on the requests.