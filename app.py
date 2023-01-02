from flask import Flask, render_template, request, redirect, url_for, session, flash, send_from_directory
import os
from werkzeug.utils import secure_filename

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(ROOT_DIR, 'img/NFTs/')
app = Flask(__name__)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
@app.route('/index.html')
def index():
    # TODO scrape on user POST request
    #import scraping
    return render_template('index.html')


@app.route('/ABI.json', methods=['GET'])
def send_json():
    return send_from_directory('.', 'ABI.json')


@app.route('/matches/<path:path>')
def send_matches(path):
    return send_from_directory('matches', path)


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)


@app.route('/img/<path:path>')
def send_img(path):
    return send_from_directory('img', path)


@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)


@app.route('/creator.html', methods=['POST', 'GET'])
def creator():
    if request.method == 'POST':
        # check if the post request has the file part
        hash = request.form.get("hash")
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            extension = filename.rsplit('.', 1)[1].lower()
            file.save(os.path.join(
                app.config['UPLOAD_FOLDER'], hash+"."+extension))

            return render_template('creator.html')+"<script>alert('File uploaded successfully')</script>"
    else:
        return render_template('creator.html')


@app.route('/market.html', methods=['GET', 'POST'])
def market():
    return render_template('market.html')


'''
@app.route('/prova.html', methods=['GET', 'POST'])
def prova2_post():
    if request.method == 'POST':
        # check if the post request has the file part
        print(request.files)
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            print("CIAOOOOOO\n", file, filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

            return render_template('prova.html')+"<script>alert('File uploaded successfully')</script>"
    return render_template('prova.html')


def __main__():
    app.run(debug=True)
'''
